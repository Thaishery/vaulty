import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from '../../Infrastructure/Server.js';
import LinkRepository from '../../Infrastructure/Repository/LinkRepository.js';
import RedirectDto from '../../Infrastructure/Dto/RedirectDto.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CodeRoute {
    static routePath = new RegExp(/^\/([a-z0-9]+)$/i);
    static routeMethod = "GET";

    static async handle(req, res, next, urlCache, db) {
        const shortCode = req.params.code;
        const linkRepository = new LinkRepository(db, urlCache);
        const link = await linkRepository.retrieveLinkByShortCode(shortCode);
        const originalUrl = link?.originalUrl;

        if (originalUrl) {
              const userAgent = req.headers['user-agent'] || '';
              if (originalUrl.includes("//www.instagram.com/") && userAgent.includes("Discordbot")) {
                let html = fs.readFileSync(path.join(__dirname, 'html', 'instagram_discord.html'), 'utf8');
                html = html.replace(/{{original_url}}/g, originalUrl);
                Server.sendHTML(res, 200, html);
                return;
              }
              const redirectDto = new RedirectDto(originalUrl, 308, {'Cache-Control': 'public, max-age=31536000, immutable'});
              Server.sendRedirect(res, redirectDto)
              return;
        }

        Server.sendJSON(res, 404, { error: 'Not Found', message: 'Shortened URL not found or expired.' });
    }
}