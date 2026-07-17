export default class ClientAgentVo {
    #rawAgent;

    constructor(userAgentStr) {
        this.#rawAgent = userAgentStr || '';
        Object.freeze(this);
    }

    isDiscordBot() {
        return this.#rawAgent.includes("Discordbot");
    }

    value() {
        return this.#rawAgent;
    }

    equals(other) {
        if (!(other instanceof ClientAgentVo)) return false;
        return this.value() === other.value();
    }
}
