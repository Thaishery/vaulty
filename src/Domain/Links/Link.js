import ShortCodeVo from "./ShortCodeVo.js";
import OriginalUrlVo from "./OriginalUrlVo.js";

export default class Link {
    #shortCode
    #originalUrl
    #ogTitle
    #ogDescription
    #ogImageUrl

    constructor(shortCode, originalUrl, ogTitle = null, ogDescription = null, ogImageUrl = null) {
        if (!(shortCode instanceof ShortCodeVo)) {
            throw new Error('shortCode must be a ShortCodeVo');
        }
        if(!(originalUrl instanceof OriginalUrlVo)) {
            throw new Error('originalUrl must be an OriginalUrlVo');
        }
        this.#shortCode = shortCode;
        this.#originalUrl = originalUrl;
        this.#ogTitle = ogTitle;
        this.#ogDescription = ogDescription;
        this.#ogImageUrl = ogImageUrl;
    }

    get shortCode() {
        return this.#shortCode;
    }

    get originalUrl() {
        return this.#originalUrl;
    }

    get ogTitle() {
        return this.#ogTitle;
    }

    get ogDescription() {
        return this.#ogDescription;
    }

    get ogImageUrl() {
        return this.#ogImageUrl;
    }

    equals(other) {
        if (!(other instanceof Link)) return false;
        return this.#shortCode.value() === other.shortCode.value();
    }

    static create(shortCode, originalUrl, ogTitle = null, ogDescription = null, ogImageUrl = null) {
        const shortCodeVo = shortCode instanceof ShortCodeVo ? shortCode : new ShortCodeVo(shortCode);
        const originalUrlVo = originalUrl instanceof OriginalUrlVo ? originalUrl : new OriginalUrlVo(originalUrl);
        return new Link(shortCodeVo, originalUrlVo, ogTitle, ogDescription, ogImageUrl);
    }
}