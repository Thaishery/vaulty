import Link from "./Link.js";

export default class LinkFactory {
    #keyGenerator;

    constructor(keyGenerator) {
        this.#keyGenerator = keyGenerator;
    }

    create(originalUrl) {
        const shortCode = this.#keyGenerator.generate();
        return new Link(shortCode, originalUrl);
    }
}