import HttpResponder from "../../Helpers/HttpResponder.js";

export class SecretRoute {
    static routePath = "/api/secret";
    static routeMethod = "POST";

    #createSecretUseCase;

    constructor(createSecretUseCase) {
        this.#createSecretUseCase = createSecretUseCase;
    }

    async handle(req, res, next) {
        let body = '';
        let bodySize = 0;
        const maxBodySize = 50 * 1024; // 50KB limit to accommodate longer passwords/secrets

        req.on('data', (chunk) => {
            bodySize += chunk.length;
            if (bodySize > maxBodySize) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload Too Large', message: 'Request body exceeds 50KB limit.' }));
                req.destroy();
            } else {
                body += chunk.toString();
            }
        });

        req.on('end', async () => {
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

                const secretText = payload.secret || payload.url;
                if (!secretText) {
                    return HttpResponder.sendJSON(res, 400, { error: 'Bad Request', message: 'Secret content is required.' });
                }

                const { token } = await this.#createSecretUseCase.execute(secretText);

                const proto = req.headers['x-forwarded-proto'] || 'http';
                const hostHeader = req.headers.host || "localhost:3000";
                const secretUrl = `${proto}://${hostHeader}/${token}`;

                return HttpResponder.sendJSON(res, 201, {
                    token,
                    secretUrl
                });
            } catch (err) {
                console.error('SecretRoute caught an error:', err);
                if (err.name === 'DomainError') {
                    return HttpResponder.sendJSON(res, 400, { error: 'Bad Request', message: err.message });
                }
                return HttpResponder.sendJSON(res, 500, { error: 'Internal Server Error', message: 'Failed to persist secret.' });
            }
        });
        return;
    }
}
