export default class ClientAgentVo {
    #rawAgent;

    static SCRAPER_USER_AGENTS = [
        'discordbot',
        'twitterbot',
        'slackbot',
        'whatsapp',
        'telegrambot',
        'facebookexternalhit',
        'baiduspider',
        'yandex'
    ];

    constructor(userAgentStr) {
        this.#rawAgent = userAgentStr || '';
        Object.freeze(this);
    }

    isScraperBot() {
        const agentLower = this.#rawAgent.toLowerCase();
        return ClientAgentVo.SCRAPER_USER_AGENTS.some(botToken => agentLower.includes(botToken));
    }

    value() {
        return this.#rawAgent;
    }

    equals(other) {
        if (!(other instanceof ClientAgentVo)) return false;
        return this.value() === other.value();
    }
}
