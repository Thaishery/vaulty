import DomainError from "../Errors/DomainError.js";

export default class AccessSecretToken {
    #token;

    constructor(token) {
        if (typeof token !== 'string') {
            throw new DomainError(
                'Access token must be a string.',
                'TOKEN_INVALID',
                'validation'
            );
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(token)) {
            throw new DomainError(
                'Access token contains invalid characters.',
                'TOKEN_INVALID_CHARACTERS',
                'validation'
            );
        }
        if (token.length < 16 || token.length > 128) {
            throw new DomainError(
                'Access token length is invalid.',
                'TOKEN_INVALID_LENGTH',
                'validation'
            );
        }
        this.#token = token;
        Object.freeze(this);
    }

    value() {
        return this.#token;
    }

    equals(other) {
        if (!(other instanceof AccessSecretToken)) return false;
        return this.value() === other.value();
    }
}
