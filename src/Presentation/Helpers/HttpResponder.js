export default class HttpResponder {
    static setSecurityHeaders(res, cspHeader = "default-src 'none'; frame-ancestors 'none';") {
        res.setHeader('Content-Security-Policy', cspHeader);
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }

    static sendJSON(res, statusCode, data) {
        this.setSecurityHeaders(res);
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    static sendRedirect(res, redirectDto) {
        this.setSecurityHeaders(res);
        res.writeHead(redirectDto.statusCode, redirectDto.headers);
        res.end();
    }

    static sendHTML(res, statusCode, html) {
        this.setSecurityHeaders(res);
        res.writeHead(statusCode, { 'Content-Type': 'text/html' });
        res.end(html);
    }
}
