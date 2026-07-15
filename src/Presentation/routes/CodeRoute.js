import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Server } from '../../Infrastructure/Server.js';
import LinkRepository from '../../Infrastructure/Repository/LinkRepository.js';

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
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(html);
                return;
              }
              // Redirect to original URL permanently and cache it
              res.writeHead(308, {
                Location: originalUrl,
                'Cache-Control': 'public, max-age=31536000, immutable'
              });
              return res.end();
        }

        Server.sendJSON(res, 404, { error: 'Not Found', message: 'Shortened URL not found or expired.' });
    }
}