import http from 'http';
import Router from 'node-router';

export class Server {
    #httpsServer;
    #router;

    constructor() {
        this.#router = Router();
        this.#httpsServer = http.createServer((req, res) => {
            this.#router(req, res, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                }
            });
        });
    }

    addRoute(method, route, handler) {
        this.#router.push(method, route, handler);
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

}