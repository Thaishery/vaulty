export class BotDetector {
    /**
     * List of regex patterns matching known messaging crawlers, bots, and link preview unfurlers.
     */
    static CRAWLER_USER_AGENTS = [
        /discordbot/i,
        /slackbot/i,
        /telegrambot/i,
        /whatsapp/i,
        /twitterbot/i,
        /facebookexternalhit/i,
        /skypeuripreview/i,
        /bingpreview/i,
        /applebot/i,
        /linkedinbot/i,
        /embedly/i,
        /quora link preview/i,
        /outbrain/i,
        /pinterest/i,
        /vkShare/i,
        /viber/i,
        /mattermost/i,
        /bot\b/i,
        /crawler/i,
        /spider/i,
        /preview/i,
        /fetcher/i
    ];

    /**
     * Checks if an incoming HTTP request originates from a known crawler / bot / unfurler or prefetch header.
     * @param {import('http').IncomingMessage} req 
     * @returns {boolean}
     */
    static isBot(req) {
        if (!req || !req.headers) return false;

        // Check HEAD request method (crawlers often send HEAD)
        if (req.method === 'HEAD') {
            return true;
        }

        // Check prefetch / preview headers sent by browsers or proxies
        const purpose = req.headers['purpose'] || req.headers['x-purpose'] || req.headers['sec-purpose'];
        if (purpose && String(purpose).toLowerCase().includes('prefetch')) {
            return true;
        }

        const userAgent = req.headers['user-agent'];
        if (!userAgent) {
            return false;
        }

        return BotDetector.CRAWLER_USER_AGENTS.some(regex => regex.test(userAgent));
    }
}
