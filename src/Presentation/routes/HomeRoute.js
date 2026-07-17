import crypto from 'crypto';
import HttpResponder from '../Helpers/HttpResponder.js';

export class HomeRoute {
    static routePath = "/";
    static routeMethod = "GET";
    
    #indexHtmlContent;

    constructor(indexHtmlContent) {
        this.#indexHtmlContent = indexHtmlContent;
    }

    async handle(req, res) {
        const nonce = crypto.randomBytes(16).toString('base64');
        const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none';`;
        HttpResponder.setSecurityHeaders(res, csp);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        try {
            const html = this.#indexHtmlContent.replace(/{{nonce}}/g, nonce);
            res.end(html);
        } catch (err) {
            console.error('HomeRoute rendering failed:', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error: Could not render homepage.');
        }
    }
}