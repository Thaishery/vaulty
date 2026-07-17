export default class ShortCodeVo {
    #shortCode;
    constructor(shortCode) {
        if (typeof shortCode !== 'string') {
            throw new Error('shortCode must be a string');
        }
        if (shortCode && !shortCode.match(/^[a-zA-Z0-9]$/)) {
            throw new Error('shortCode is composed of invalid characters.');
        }
        this.#shortCode = shortCode;
        Object.freeze(this);
    }

    value() {
        return this.#shortCode;
    }
}