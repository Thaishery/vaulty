import TokenVo from '../../Domain/Secrets/TokenVo.js';
import { CryptoService } from '../../Infrastructure/Services/CryptoService.js';

export default class RetrieveSecretUseCase {
    #secretRepository;

    constructor(secretRepository) {
        this.#secretRepository = secretRepository;
    }

    /**
     * Retrieves, decrypts, and deletes a secret using a raw URL token.
     * @param {string} token - Raw token from URL
     * @returns {Promise<string|null>} - Plaintext secret or null if not found/already consumed
     */
    async execute(token) {
        // 1. Validate the token
        const tokenVo = new TokenVo(token);

        // 2. Derive dbKey and encryption key
        const { dbKey, encryptionKey } = CryptoService.deriveKeys(tokenVo.value());
        const dbKeyVo = new TokenVo(dbKey);

        // 3. Look up secret in repository
        const secret = await this.#secretRepository.retrieveSecretByDbKey(dbKeyVo);
        if (!secret) {
            return null;
        }

        // 4. Delete secret from DB and cache immediately (destructive read)
        await this.#secretRepository.delete(dbKeyVo);

        // 5. Decrypt the secret
        try {
            const plaintext = CryptoService.decrypt(
                secret.encryptedContent,
                encryptionKey,
                secret.iv,
                secret.authTag
            );
            return plaintext;
        } catch (err) {
            console.error('Decryption of secret failed:', err.message || err);
            return null;
        }
    }
}
