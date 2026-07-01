import http from 'http';
import crypto from 'crypto';
import fs from 'fs';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1'; // MUST listen on localhost or 127.0.0.1 when testing

// In-memory cache for shortened URLs: shortCode -> originalUrl
const urlCache = new Map();

// Rate limiter: ip -> { count, resetTime }
const rateLimits = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

// Timestamp-based key generation (nanosecond precision)
// Guarantees O(1) collision-free generation without querying the cache
let counter = 0n;
function generateKey() {
  const ns = process.hrtime.bigint();
  const key = (ns + (counter++)).toString(36);
  return key;
}

// Simple helper to check and apply rate limits
function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  const limit = rateLimits.get(ip);
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + RATE_LIMIT_WINDOW_MS;
    return false;
  }

  limit.count++;
  return limit.count > MAX_REQUESTS_PER_WINDOW;
}

// Set secure HTTP headers
function setSecurityHeaders(res, cspHeader = "default-src 'none'; frame-ancestors 'none';") {
  res.setHeader('Content-Security-Policy', cspHeader);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Access-Control-Allow-Origin', 'null'); // Restrict origin access
}

// Send JSON response helper
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const ip = req.socket.remoteAddress || 'unknown';

  // Apply rate limiting
  if (checkRateLimit(ip)) {
    setSecurityHeaders(res);
    return sendJSON(res, 429, { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' });
  }

  // Set default security headers
  setSecurityHeaders(res);

  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = url.pathname;

  // GET / -> API status check
  if (req.method === 'GET' && pathname === '/') {
    const nonce = crypto.randomBytes(16).toString('base64');
    const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; form-action 'self'; frame-ancestors 'none';`;
    setSecurityHeaders(res, csp);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    try {
      let html = fs.readFileSync('./index.html', 'utf8');
      html = html.replace(/{{nonce}}/g, nonce);
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error: Could not load index.html');
    }
    return;
  }

  // POST /api/shorten -> Create shortened URL
  if (req.method === 'POST' && pathname === '/api/shorten') {
    let body = '';
    let bodySize = 0;
    const maxBodySize = 10 * 1024; // 10KB limit to prevent DoS

    req.on('data', (chunk) => {
      bodySize += chunk.length;
      if (bodySize > maxBodySize) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload Too Large', message: 'Request body exceeds 10KB limit.' }));
        req.destroy();
      } else {
        body += chunk.toString();
      }
    });

    req.on('end', () => {
      // If request was already destroyed due to limit, return
      if (res.writableEnded) return;

      try {
        if (!body) {
          return sendJSON(res, 400, { error: 'Bad Request', message: 'Missing request body.' });
        }

        const payload = JSON.parse(body);
        const originalUrl = payload.url;

        // Input validation
        if (!originalUrl || typeof originalUrl !== 'string') {
          return sendJSON(res, 400, { error: 'Bad Request', message: 'URL is required and must be a string.' });
        }

        if (originalUrl.length > 2048) {
          return sendJSON(res, 400, { error: 'Bad Request', message: 'URL length cannot exceed 2048 characters.' });
        }

        // Validate URL format and protocol
        let parsedUrl;
        try {
          parsedUrl = new URL(originalUrl);
        } catch (_) {
          return sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid URL format.' });
        }

        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return sendJSON(res, 400, { error: 'Bad Request', message: 'Only http and https protocols are supported.' });
        }

        // Generate short code
        const shortCode = generateKey();
        
        // Store in-memory cache mapping
        urlCache.set(shortCode, originalUrl);

        // Return response dynamically using client request host header
        const proto = req.headers['x-forwarded-proto'] || 'http';
        const hostHeader = req.headers.host || `${HOST}:${PORT}`;
        const shortenedLink = `${proto}://${hostHeader}/${shortCode}`;
        return sendJSON(res, 201, {
          shortCode,
          shortUrl: shortenedLink,
          originalUrl
        });

      } catch (err) {
        return sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid JSON payload.' });
      }
    });
    return;
  }

  // GET /:code -> Redirect to original URL
  // Validate that code is alphanumeric using simple strict regex to avoid path traversal
  const redirectMatch = pathname.match(/^\/([a-z0-9]+)$/i);
  if (req.method === 'GET' && redirectMatch) {
    const shortCode = redirectMatch[1];
    const originalUrl = urlCache.get(shortCode);

    if (originalUrl) {
      // Redirect to original URL permanently and cache it
      res.writeHead(308, {
        Location: originalUrl,
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      return res.end();
    } else {
      return sendJSON(res, 404, { error: 'Not Found', message: 'Shortened URL not found or expired.' });
    }
  }

  // Fallback for all other routes
  return sendJSON(res, 404, { error: 'Not Found', message: 'Route not found.' });
});

// Global error handling
server.on('error', (err) => {
  console.error('Server encountered error:', err.message);
});

server.listen(PORT, HOST, () => {
  console.log(`URL Shortener server running at http://${HOST}:${PORT}/`);
});
