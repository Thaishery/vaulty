import SecretRepositoryInterface from '../../Domain/Secrets/SecretRepositoryInterface.js';
import Secret from '../../Domain/Secrets/Secret.js';

export default class CachedSecretRepository extends SecretRepositoryInterface {
    #innerRepository;
    #cache;

    constructor(innerRepository, cache) {
        super();
        this.#innerRepository = innerRepository;
        this.#cache = cache;
    }

    async retrieveSecretByDbKey(dbKeyVo) {
        const dbKey = dbKeyVo.value();
        if (this.#cache.has(dbKey)) {
            const cached = this.#cache.get(dbKey);
            return new Secret(
                dbKeyVo,
                cached.encryptedContent,
                cached.iv,
                cached.authTag
            );
        }

        const secret = await this.#innerRepository.retrieveSecretByDbKey(dbKeyVo);
        if (secret) {
            this.#cache.set(dbKey, {
                encryptedContent: secret.encryptedContent,
                iv: secret.iv,
                authTag: secret.authTag
            });
        }
        return secret;
    }

    async save(secret) {
        await this.#innerRepository.save(secret);
        this.#cache.set(secret.id.value(), {
            encryptedContent: secret.encryptedContent,
            iv: secret.iv,
            authTag: secret.authTag
        });
    }

    async delete(dbKeyVo) {
        const dbKey = dbKeyVo.value();
        this.#cache.delete(dbKey);
        await this.#innerRepository.delete(dbKeyVo);
    }
}
