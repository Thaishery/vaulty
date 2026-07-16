export default class ShortCodeVo {
    #shortCode;
    constructor(shortCode) {
        if (typeof shortCode !== 'string') {
            throw new Error('shortCode must be a string');
        }
        this.#shortCode = shortCode;
        Object.freeze(this);
    }

    value() {
        return this.#shortCode;
    }
}