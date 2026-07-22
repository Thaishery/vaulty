import AccessSecretToken from '../../Domain/Secrets/AccessSecretToken.js';
import SecretLookupHash from '../../Domain/Secrets/SecretLookupHash.js';
import SecretTTL from '../../Domain/Secrets/SecretTTL.js';

export default class RetrieveSecretUseCase {
    #secretRepository;
    #secretCrypto;

    constructor(secretRepository, secretCrypto) {
        this.#secretRepository = secretRepository;
        this.#secretCrypto = secretCrypto;
    }

    /**
     * Retrieves, decrypts, and deletes a secret using a raw URL token.
     * @param {string} token - Raw token from URL
     * @returns {Promise<string|null>} - Plaintext secret or null if not found/already consumed/expired
     */
    async execute(token) {
        // 1. Validate the token
        const accessToken = new AccessSecretToken(token);

        // 2. Derive dbKey and encryption key
        const { dbKey, encryptionKey } = this.#secretCrypto.deriveKeys(accessToken.value());
        const lookupHash = new SecretLookupHash(dbKey);

        // 3. Look up secret in repository
        const secret = await this.#secretRepository.findByHash(lookupHash);
        if (!secret) {
            return null;
        }

        // 4. Delete secret from DB immediately (destructive read)
        await this.#secretRepository.deleteByHash(lookupHash);

        // 5. Check domain expiration invariant
        if (secret.isExpired(SecretTTL.default())) {
            return null;
        }

        // 6. Decrypt the secret
        try {
            const payload = secret.encryptedPayload;
            const plaintext = this.#secretCrypto.decrypt(
                payload.ciphertext,
                encryptionKey,
                payload.iv,
                payload.authTag
            );
            return plaintext;
        } catch (err) {
            console.error('Decryption of secret failed:', err.message || err);
            return null;
        }
    }
}

