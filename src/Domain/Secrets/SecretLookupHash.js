import DomainError from "../Errors/DomainError.js";

export default class SecretLookupHash {
    #hash;

    constructor(hash) {
        if (typeof hash !== 'string') {
            throw new DomainError(
                'Lookup hash must be a string.',
                'HASH_INVALID',
                'validation'
            );
        }
        if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
            throw new DomainError(
                'Lookup hash must be a 64-character hex string.',
                'HASH_INVALID_FORMAT',
                'validation'
            );
        }
        this.#hash = hash.toLowerCase();
        Object.freeze(this);
    }

    value() {
        return this.#hash;
    }

    equals(other) {
        if (!(other instanceof SecretLookupHash)) return false;
        return this.value() === other.value();
    }
}
