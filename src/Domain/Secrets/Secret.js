import SecretLookupHash from "./SecretLookupHash.js";
import EncryptedPayload from "./EncryptedPayload.js";
import SecretTTL from "./SecretTTL.js";
import DomainError from "../Errors/DomainError.js";

export default class Secret {
    #lookupHash;
    #encryptedPayload;
    #createdAt;

    constructor(lookupHash, encryptedPayload, createdAt = new Date()) {
        if (!(lookupHash instanceof SecretLookupHash)) {
            throw new DomainError(
                'lookupHash must be a SecretLookupHash instance.',
                'LOOKUP_HASH_INVALID',
                'validation'
            );
        }
        if (!(encryptedPayload instanceof EncryptedPayload)) {
            throw new DomainError(
                'encryptedPayload must be an EncryptedPayload instance.',
                'ENCRYPTED_PAYLOAD_INVALID',
                'validation'
            );
        }

        const parsedDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
        if (isNaN(parsedDate.getTime())) {
            throw new DomainError(
                'createdAt must be a valid Date.',
                'CREATED_AT_INVALID',
                'validation'
            );
        }

        this.#lookupHash = lookupHash;
        this.#encryptedPayload = encryptedPayload;
        this.#createdAt = parsedDate;
        Object.freeze(this);
    }

    get lookupHash() {
        return this.#lookupHash;
    }

    get id() {
        return this.#lookupHash;
    }

    get encryptedPayload() {
        return this.#encryptedPayload;
    }

    get createdAt() {
        return this.#createdAt;
    }

    isExpired(ttl = SecretTTL.default(), now = new Date()) {
        const activeTtl = ttl instanceof SecretTTL ? ttl : new SecretTTL(ttl);
        return activeTtl.isExpired(this.#createdAt, now);
    }

    static create(lookupHash, encryptedPayload, createdAt = new Date()) {
        const hashVo = lookupHash instanceof SecretLookupHash ? lookupHash : new SecretLookupHash(lookupHash);
        return new Secret(hashVo, encryptedPayload, createdAt);
    }
}
