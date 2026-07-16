import { Server } from "../../../Infrastructure/Server.js";

export class ShortyRoute {
    static routePath = "/api/shorty";
    static routeMethod = "POST";

    #linkFactory;
    #linkRepository;

    constructor(linkFactory,linkRepository){
        this.#linkFactory = linkFactory;
        this.#linkRepository = linkRepository;
    }

    async handle(req, res, next) {
        let body = '';
        let bodySize = 0;
        const maxBodySize = 10 * 1024; // 10KB limit to prevent DoS

        req.on('data', (chunk) => {
            bodySize += chunk.length;
            if (bodySize > maxBodySize) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload Too Large', message: 'Request body exceeds 10KB limit.' }));
                req.destroy();
            } else {
                body += chunk.toString();
            }
        });

        req.on('end', async () => {
            // If request was already destroyed due to limit, return
            if (res.writableEnded) return;

            try {
                if (!body) {
                    return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Missing request body.' });
                }

                const payload = JSON.parse(body);

                // // Input validation
                // if (!originalUrl || typeof originalUrl !== 'string') {
                //     return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'URL is required and must be a string.' });
                // }

                // if (originalUrl.length > 2048) {
                //     return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'URL length cannot exceed 2048 characters.' });
                // }

                // // Validate URL format and protocol
                // let parsedUrl;
                // try {
                //     parsedUrl = new URL(originalUrl);
                // } catch (_) {
                //     return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid URL format.' });
                // }

                // if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
                //     return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Only http and https protocols are supported.' });
                // }

                // Generate short code
                const link = this.#linkFactory.create(payload.url);
                try{
                    await this.#linkRepository.save(link);
                    const proto = req.headers['x-forwarded-proto'] || 'http';
                    const hostHeader = req.headers.host || "localhost:3000";
                    const shortenedLink = `${proto}://${hostHeader}/${link.shortCode}`;
                    return Server.sendJSON(res, 201, {
                        shortCode: link.shortCode,
                        shortUrl: shortenedLink,
                        originalUrl
                    });
                } catch (e) {
                    return Server.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to persist shortened URL.' });
                }
            } catch (err) {
                console.log(err)
                return Server.sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid JSON payload.' });
            }
        });
        return;
    }
}