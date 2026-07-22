import TokenVo from "./TokenVo.js";

export default class Secret {
    #id;
    #encryptedContent;
    #iv;
    #authTag;

    constructor(id, encryptedContent, iv, authTag) {
        if (!(id instanceof TokenVo)) {
            throw new Error('id must be a TokenVo');
        }
        if (typeof encryptedContent !== 'string' || !encryptedContent) {
            throw new Error('encryptedContent must be a non-empty string');
        }
        if (typeof iv !== 'string' || !iv) {
            throw new Error('iv must be a non-empty string');
        }
        if (typeof authTag !== 'string' || !authTag) {
            throw new Error('authTag must be a non-empty string');
        }

        this.#id = id;
        this.#encryptedContent = encryptedContent;
        this.#iv = iv;
        this.#authTag = authTag;
        Object.freeze(this);
    }

    get id() {
        return this.#id;
    }

    get encryptedContent() {
        return this.#encryptedContent;
    }

    get iv() {
        return this.#iv;
    }

    get authTag() {
        return this.#authTag;
    }

    static create(id, encryptedContent, iv, authTag) {
        const tokenVo = id instanceof TokenVo ? id : new TokenVo(id);
        return new Secret(tokenVo, encryptedContent, iv, authTag);
    }
}
