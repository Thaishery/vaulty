import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import HttpResponder from '../Helpers/HttpResponder.js';
import RedirectDto from '../Dto/RedirectDto.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CodeRoute {
    static routePath = new RegExp(/^\/([a-z0-9]+)$/i);
    static routeMethod = "GET";

    #redirectUrlUseCase;

    constructor(redirectUrlUseCase){
        this.#redirectUrlUseCase = redirectUrlUseCase;
    }

    async handle(req, res, next) {
        try {
            const shortCode = req.params.code;
            const userAgent = req.headers['user-agent'] || '';

            const { link, shouldRenderPreview } = await this.#redirectUrlUseCase.execute(shortCode, userAgent);

            if (link) {
                const originalUrl = link.originalUrl.value();
                if (shouldRenderPreview) {
                    let html = fs.readFileSync(path.join(__dirname, '../../html', 'instagram_discord.html'), 'utf8');
                    html = html.replace(/{{original_url}}/g, originalUrl);
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