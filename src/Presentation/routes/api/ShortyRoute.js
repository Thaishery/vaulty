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
                const link = this.#linkFactory.create(payload.url);
                try{
                    await this.#linkRepository.save(link);
                    const proto = req.headers['x-forwarded-proto'] || 'http';
                    const hostHeader = req.headers.host || "localhost:3000";
                    const shortenedLink = `${proto}://${hostHeader}/${link.shortCode.value()}`;
                    return Server.sendJSON(res, 201, {
                        shortCode: link.shortCode.value(),
                        shortUrl: shortenedLink,
                        originalUrl: link.originalUrl.value()
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