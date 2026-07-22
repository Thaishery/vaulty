export class SecretViewRenderer {
    /**
     * Renders secret HTML page with appropriate status and escaped content.
     * @param {string} template 
     * @param {string} nonce 
     * @param {string|null} decryptedSecret 
     * @returns {string} Renders HTML string
     */
    static render(template, nonce, decryptedSecret) {
        let html = template.replace(/{{nonce}}/g, nonce);

        if (decryptedSecret !== null) {
            const escapedSecret = SecretViewRenderer.escapeHTML(decryptedSecret);

            return html
                .replace(/{{title}}/g, "Voici votre secret sécurisé")
                .replace(/{{message}}/g, "Attention: Ce secret à vue unique a été définitivement supprimé du serveur. Copiez-le avant de fermer cette page.")
                .replace(/{{secret_content}}/g, escapedSecret)
                .replace(/{{secret_display_style}}/g, "block")
                .replace(/{{secret_display_class}}/g, "result--visible")
                .replace(/{{status_class}}/g, "alert--success");
        } else {
            return html
                .replace(/{{title}}/g, "Secret non trouvé ou déjà consommé")
                .replace(/{{message}}/g, "Ce lien de partage éphémère n'existe plus ou a déjà été consulté et détruit de la base de données.")
                .replace(/{{secret_content}}/g, "")
                .replace(/{{secret_display_style}}/g, "none")
                .replace(/{{secret_display_class}}/g, "")
                .replace(/{{status_class}}/g, "alert--error");
        }
    }

    /**
     * Escapes unsafe characters for HTML display.
     * @param {string} str 
     * @returns {string}
     */
    static escapeHTML(str) {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
