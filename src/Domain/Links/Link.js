import ShortCodeVo from "./ShortCodeVo.js";
import OriginalUrlVo from "./OriginalUrlVo.js";

export default class Link {
    #shortCode
    #originalUrl

    constructor(shortCode, originalUrl) {
        if (!(shortCode instanceof ShortCodeVo)) {
            throw new Error('shortCode must be a ShortCodeVo');
        }
        if(!(originalUrl instanceof OriginalUrlVo)) {
            throw new Error('originalUrl must be an OriginalUrlVo');
        }
        this.#shortCode = shortCode;
        this.#originalUrl = originalUrl;
    }

    get shortCode() {
        return this.#shortCode;
    }

    get originalUrl() {
        return this.#originalUrl;
    }

    equals(other) {
        if (!(other instanceof Link)) return false;
        return this.#shortCode.value() === other.shortCode.value();
    }

    static create(shortCode, originalUrl) {
        const shortCodeVo = shortCode instanceof ShortCodeVo ? shortCode : new ShortCodeVo(shortCode);
        const originalUrlVo = originalUrl instanceof OriginalUrlVo ? originalUrl : new OriginalUrlVo(originalUrl);
        return new Link(shortCodeVo, originalUrlVo);
    }
}