import HttpResponder from '../Helpers/HttpResponder.js';
import { SecretViewRenderer } from '../Helpers/SecretViewRenderer.js';
import crypto from 'crypto';

export class ViewSecretRoute {
    static routePath = new RegExp(/^\/([a-zA-Z0-9_-]{16,128})$/);
    static routeMethod = "GET";

    #retrieveSecretUseCase;
    #secretHtmlContent;

    constructor(retrieveSecretUseCase, secretHtmlContent){
        this.#retrieveSecretUseCase = retrieveSecretUseCase;
        this.#secretHtmlContent = secretHtmlContent;
    }

    async handle(req, res, next) {
        try {
            const token = req.params.code;
            const decryptedSecret = await this.#retrieveSecretUseCase.execute(token);

            const nonce = crypto.randomBytes(16).toString('base64');
            const csp = `default-src 'none'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none';`;
            HttpResponder.setSecurityHeaders(res, csp);

            const html = SecretViewRenderer.render(this.#secretHtmlContent, nonce, decryptedSecret);

            HttpResponder.sendHTML(res, 200, html, csp);
        } catch (err) {
            console.error('ViewSecretRoute caught an error:', err);
            return HttpResponder.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to retrieve secret.' });
        }
    }
}
