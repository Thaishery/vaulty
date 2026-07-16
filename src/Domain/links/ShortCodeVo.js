export default class ShortCodeVo {
    #shortCode;
    constructor(shortCode) {
        if (typeof shortCode !== 'string') {
            throw new Error('shortCode must be a string');
        }
        if (shortCode.length !== 6) {
            throw new Error('shortCode must be 6 characters long');
        }
        this.#shortCode = shortCode;
        Object.freeze(this);
    }

    value() {
        return this.#shortCode;
    }
}