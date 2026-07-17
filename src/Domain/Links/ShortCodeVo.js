import DomainError from "../Errors/DomainError.js";

export default class ShortCodeVo {
    #shortCode;
    constructor(shortCode) {
        if (typeof shortCode !== 'string') {
            throw new DomainError(
                'shortCode must be a string.',
                'SHORTCODE_INVALID',
                'validation'
            );
        }
        if (!new RegExp(/^[a-zA-Z0-9]+$/).test(shortCode)) {
            throw new DomainError(
                'shortCode is composed of invalid characters.',
                'SHORTCODE_INVALID_CHARACTERS',
                'validation'
            );
        }
        this.#shortCode = shortCode;
        Object.freeze(this);
    }

    value() {
        return this.#shortCode;
    }
}