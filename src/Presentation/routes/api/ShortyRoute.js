import HttpResponder from "../../Helpers/HttpResponder.js";

export class ShortyRoute {
    static routePath = "/api/shorty";
    static routeMethod = "POST";

    #shortenUrlUseCase;

    constructor(shortenUrlUseCase) {
        this.#shortenUrlUseCase = shortenUrlUseCase;
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
                    return HttpResponder.sendJSON(res, 400, { error: 'Bad Request', message: 'Missing request body.' });
                }
                let payload;
                try {
                    payload = JSON.parse(body);
                } catch (e) {
                    return HttpResponder.sendJSON(res, 400, { error: 'Bad Request', message: 'Invalid JSON payload.' });
                }

                const link = await this.#shortenUrlUseCase.execute(
                    payload.url,
                    payload.ogTitle || null,
                    payload.ogDescription || null,
                    payload.ogImageUrl || null
                );

                const proto = req.headers['x-forwarded-proto'] || 'http';
                const hostHeader = req.headers.host || "localhost:3000";
                const shortenedLink = `${proto}://${hostHeader}/${link.shortCode.value()}`;
                return HttpResponder.sendJSON(res, 201, {
                    shortCode: link.shortCode.value(),
                    shortUrl: shortenedLink,
                    originalUrl: link.originalUrl.value(),
                    ogTitle: link.ogTitle,
                    ogDescription: link.ogDescription,
                    ogImageUrl: link.ogImageUrl
                });
            } catch (err) {
                console.error('ShortyRoute caught an error:', err);
                if (err.name === 'DomainError') {
                    return HttpResponder.sendJSON(res, 400, { error: 'Bad Request', message: err.message });
                }
                return HttpResponder.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to persist shortened URL.' });
            }
        });
        return;
    }
}