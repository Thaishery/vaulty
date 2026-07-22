import HttpResponder from '../Helpers/HttpResponder.js';
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

            let html = this.#secretHtmlContent.replace(/{{nonce}}/g, nonce);

            if (decryptedSecret !== null) {
                const escapedSecret = decryptedSecret
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

                html = html
                    .replace(/{{title}}/g, "Voici votre secret sécurisé")
                    .replace(/{{message}}/g, "Attention: Ce secret à vue unique a été définitivement supprimé du serveur. Copiez-le avant de fermer cette page.")
                    .replace(/{{secret_content}}/g, escapedSecret)
                    .replace(/{{secret_display_style}}/g, "block")
                    .replace(/{{secret_display_class}}/g, "result--visible")
                    .replace(/{{status_class}}/g, "alert--success");
            } else {
                html = html
                    .replace(/{{title}}/g, "Secret non trouvé ou déjà consommé")
                    .replace(/{{message}}/g, "Ce lien de partage éphémère n'existe plus ou a déjà été consulté et détruit de la base de données.")
                    .replace(/{{secret_content}}/g, "")
                    .replace(/{{secret_display_style}}/g, "none")
                    .replace(/{{secret_display_class}}/g, "")
                    .replace(/{{status_class}}/g, "alert--error");
            }

            HttpResponder.sendHTML(res, 200, html, csp);
        } catch (err) {
            console.error('ViewSecretRoute caught an error:', err);
            return HttpResponder.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to retrieve secret.' });
        }
    }
}
