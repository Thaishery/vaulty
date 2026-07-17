import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import HttpResponder from '../Helpers/HttpResponder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class HomeRoute {
    static routePath = "/";
    static routeMethod = "GET";
    
    static async handle(req, res) {
        const nonce = crypto.randomBytes(16).toString('base64');
        const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none';`;
        HttpResponder.setSecurityHeaders(res, csp);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        try {
            let html = fs.readFileSync(path.join(__dirname, '../../html', 'index.html'), 'utf8');
            html = html.replace(/{{nonce}}/g, nonce);
            res.end(html);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error: Could not load index.html');
        }
        return;
    }
}