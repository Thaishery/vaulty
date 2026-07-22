import DomainError from "../Errors/DomainError.js";

export default class EncryptedPayload {
    #ciphertext;
    #iv;
    #authTag;

    constructor(ciphertext, iv, authTag) {
        if (typeof ciphertext !== 'string' || !ciphertext.trim()) {
            throw new DomainError(
                'Ciphertext must be a non-empty string.',
                'CIPHERTEXT_INVALID',
                'validation'
            );
        }
        if (typeof iv !== 'string' || !iv.trim()) {
            throw new DomainError(
                'IV must be a non-empty string.',
                'IV_INVALID',
                'validation'
            );
        }
        if (typeof authTag !== 'string' || !authTag.trim()) {
            throw new DomainError(
                'Auth tag must be a non-empty string.',
                'AUTH_TAG_INVALID',
                'validation'
            );
        }

        this.#ciphertext = ciphertext;
        this.#iv = iv;
        this.#authTag = authTag;
        Object.freeze(this);
    }

    get ciphertext() {
        return this.#ciphertext;
    }

    get iv() {
        return this.#iv;
    }

    get authTag() {
        return this.#authTag;
    }

    equals(other) {
        if (!(other instanceof EncryptedPayload)) return false;
        return (
            this.ciphertext === other.ciphertext &&
            this.iv === other.iv &&
            this.authTag === other.authTag
        );
    }
}
