import { Server } from "../../../Infrastructure/Server.js";
import { KeyGenerator } from "../../../Domain/links/KeyGenerator.js";

export class ShortyRoute {
    static routePath = "/api/shorty";
    static routeMethod = "POST";

    static async handle(req, res, next, urlCache, db) {
        console.log("urlCache", urlCache);
        console.log("db", db);
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

        req.on('end', async () => {
            // If request was already destroyed due to limit, return
            if (res.writableEnded) return;

            try {
                if (!body) {
                    return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Missing request body.' });
                }

            const payload = JSON.parse(body);
            const originalUrl = payload.url;

            // Input validation
            if (!originalUrl || typeof originalUrl !== 'string') {
                return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'URL is required and must be a string.' });
            }

            if (originalUrl.length > 2048) {
                return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'URL length cannot exceed 2048 characters.' });
            }

            // Validate URL format and protocol
            let parsedUrl;
            try {
                parsedUrl = new URL(originalUrl);
            } catch (_) {
                return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid URL format.' });
            }

            if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Only http and https protocols are supported.' });
            }

            // Generate short code
            const keyGenerator = new KeyGenerator()
            const shortCode = keyGenerator.generate();

            // Store in SQLite database
            const stmt = db.prepare('INSERT INTO urls (short_code, original_url) VALUES (?, ?)');
            stmt.run(shortCode, originalUrl, function (err) {
                if (err) {
                    console.error('Database insert error:', err.message);
                    return Server.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to persist shortened URL.' });
                }

                // Store in-memory cache mapping
                urlCache.set(shortCode, originalUrl);

                // Return response dynamically using client request host header
                const proto = req.headers['x-forwarded-proto'] || 'http';
                const hostHeader = req.headers.host || `${HOST}:${PORT}`;
                const shortenedLink = `${proto}://${hostHeader}/${shortCode}`;
                return Server.sendJSON(res, 201, {
                    shortCode,
                    shortUrl: shortenedLink,
                    originalUrl
                });
            });
            stmt.finalize();

        } catch (err) {
            console.log(err)
            return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid JSON payload.' });
        }
        });
        return;
    }
}