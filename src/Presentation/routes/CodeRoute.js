import HttpResponder from '../Helpers/HttpResponder.js';
import RedirectDto from '../Dto/RedirectDto.js';

export class CodeRoute {
    static routePath = new RegExp(/^\/([a-z0-9]+)$/i);
    static routeMethod = "GET";

    #redirectUrlUseCase;
    #previewHtmlContent;

    constructor(redirectUrlUseCase, previewHtmlContent){
        this.#redirectUrlUseCase = redirectUrlUseCase;
        this.#previewHtmlContent = previewHtmlContent;
    }

    async handle(req, res, next) {
        try {
            const shortCode = req.params.code;
            const userAgent = req.headers['user-agent'] || '';

            const { link, shouldRenderPreview } = await this.#redirectUrlUseCase.execute(shortCode, userAgent);

            if (link) {
                const originalUrl = link.originalUrl.value();
                if (shouldRenderPreview) {
                    const title = link.ogTitle || "Url raccourci par shorty";
                    const description = link.ogDescription || "Merci d'utiliser shorty pour raccourcir vos url. plus de detail ici : https://github.com/guillaume/shorty";

                    let imageUrl = link.ogImageUrl;
                    if (!imageUrl) {
                        const proto = req.headers['x-forwarded-proto'] || 'http';
                        const hostHeader = req.headers.host || "localhost:3000";
                        imageUrl = `${proto}://${hostHeader}/assets/shorty.png`;
                    }

                    const html = this.#previewHtmlContent
                        .replace(/{{title}}/g, title)
                        .replace(/{{description}}/g, description)
                        .replace(/{{image_url}}/g, imageUrl)
                        .replace(/{{original_url}}/g, originalUrl);

                    HttpResponder.sendHTML(res, 200, html);
                    return;
                }
                const redirectDto = new RedirectDto(originalUrl, 308, { 'Cache-Control': 'public, max-age=31536000, immutable' });
                HttpResponder.sendRedirect(res, redirectDto);
                return;
            }

            HttpResponder.sendJSON(res, 404, { error: 'Not Found', message: 'Shortened URL not found or expired.' });
        } catch (err) {
            console.error('CodeRoute caught an error:', err);
            if (err.name === 'DomainError') {
                return HttpResponder.sendJSON(res, 400, { error: 'Bad Request', message: err.message });
            }
            return HttpResponder.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to process redirection.' });
        }
    }
}