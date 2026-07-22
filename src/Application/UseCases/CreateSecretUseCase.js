import Secret from '../../Domain/Secrets/Secret.js';
import SecretLookupHash from '../../Domain/Secrets/SecretLookupHash.js';
import EncryptedPayload from '../../Domain/Secrets/EncryptedPayload.js';

export default class CreateSecretUseCase {
    #secretRepository;
    #keyGenerator;
    #secretCrypto;

    constructor(secretRepository, keyGenerator, secretCrypto) {
        this.#secretRepository = secretRepository;
        this.#keyGenerator = keyGenerator;
        this.#secretCrypto = secretCrypto;
    }

    /**
     * Creates and encrypts a secret, then persists it using a hashed key.
     * @param {string} plaintextSecret
     * @returns {Promise<{ token: string, secret: Secret }>}
     */
    async execute(plaintextSecret) {
        if (typeof plaintextSecret !== 'string' || !plaintextSecret) {
            throw new Error('Secret must be a non-empty string');
        }

        // 1. Generate the secure access token
        const accessToken = this.#keyGenerator.generate();
        const token = accessToken.value();

        // 2. Derive dbKey and encryption key via Domain Crypto Service
        const { dbKey, encryptionKey } = this.#secretCrypto.deriveKeys(token);

        // 3. Encrypt the secret
        const { ciphertext, iv, tag } = this.#secretCrypto.encrypt(plaintextSecret, encryptionKey);

        // 4. Create and save Secret entity using lookup hash & encrypted payload
        const lookupHash = new SecretLookupHash(dbKey);
        const encryptedPayload = new EncryptedPayload(ciphertext, iv, tag);
        const secret = Secret.create(lookupHash, encryptedPayload);
        await this.#secretRepository.save(secret);

        return { token, secret };
    }
}

