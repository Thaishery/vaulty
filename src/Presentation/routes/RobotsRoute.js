import HttpResponder from '../Helpers/HttpResponder.js';

export class RobotsRoute {
    static routePath = "/robots.txt";
    static routeMethod = "GET";

    static async handle(req, res) {
        HttpResponder.setSecurityHeaders(res);
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end("User-agent: *\nAllow: /\n");
    }
}
