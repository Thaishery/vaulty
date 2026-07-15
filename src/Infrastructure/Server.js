import http from 'http';
import Router from 'node-router';
import { Firewall } from './Firewall.js';

export class Server {
    #httpsServer;
    #router;
    #firewall;
    #urlCache;
    #db;

    constructor(urlCache, db) {
        this.#router = Router();
        this.#firewall = new Firewall();
        this.#urlCache = urlCache;
        this.#db = db;
        this.#httpsServer = http.createServer((req, res) => {
            if (this.#firewall.checkRateLimit(req.socket.remoteAddress || 'unknown')) {
                Server.setSecurityHeaders(res);
                Server.sendJSON(res, 429, { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' });
                return;
            }
            this.#router(req, res, (err) => {
                if (err) {
                    Server.setSecurityHeaders(res);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            });
        });
    }

    addRoute(method, route, handler) {
    if (route instanceof RegExp) {
        this.#router.push(method, (req, res, next) => {
            const match = req.path.match(route);
            if (match) {
                req.params = { code: match[1] };
                handler(req, res, next, this.#urlCache, this.#db);
            } else {
                next();
            }
        });
    } else {
        this.#router.push(method, route, (req, res, next) => {
            handler(req, res, next, this.#urlCache, this.#db);
        });
    }
}

    start(port, hostname) {
        this.#httpsServer.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    }

    stop() {
        this.#httpsServer.close();
    }

    static sendJSON(res, statusCode, data) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    static setSecurityHeaders(res, cspHeader = "default-src 'none'; frame-ancestors 'none';") {
        res.setHeader('Content-Security-Policy', cspHeader);
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Access-Control-Allow-Origin', 'null');
    }
}
