export default class Link {
    #shortCode
    #originalUrl

    constructor(shortCode, originalUrl) {
        this.#shortCode = shortCode;
        this.#originalUrl = originalUrl;
    }

    get shortCode() {
        return this.#shortCode;
    }

    get originalUrl() {
        return this.#originalUrl;
    }

    set shortCode(shortCode) {
        this.#shortCode = shortCode;
    }

    set originalUrl(originalUrl) {
        this.#originalUrl = originalUrl;
    }
}