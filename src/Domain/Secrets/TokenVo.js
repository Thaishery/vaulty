import DomainError from "../Errors/DomainError.js";

export default class TokenVo {
    #token;

    constructor(token) {
        if (typeof token !== 'string') {
            throw new DomainError(
                'Token must be a string.',
                'TOKEN_INVALID',
                'validation'
            );
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(token)) {
            throw new DomainError(
                'Token contains invalid characters.',
                'TOKEN_INVALID_CHARACTERS',
                'validation'
            );
        }
        if (token.length < 16 || token.length > 128) {
            throw new DomainError(
                'Token length is invalid.',
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
        if (!(other instanceof TokenVo)) return false;
        return this.value() === other.value();
    }
}
