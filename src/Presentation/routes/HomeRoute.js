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
        try {
            const nonce = crypto.randomBytes(16).toString('base64');
            const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none';`;
            const html = this.#indexHtmlContent.replace(/{{nonce}}/g, nonce);
            HttpResponder.sendHTML(res, 200, html, csp);
        } catch (err) {
            console.error('HomeRoute rendering failed:', err);
            HttpResponder.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Could not render homepage.' });
        }
    }
}