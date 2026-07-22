import Secret from '../../Domain/Secrets/Secret.js';
import TokenVo from '../../Domain/Secrets/TokenVo.js';
import { CryptoService } from '../../Infrastructure/Services/CryptoService.js';

export default class CreateSecretUseCase {
    #secretRepository;
    #keyGenerator;

    constructor(secretRepository, keyGenerator) {
        this.#secretRepository = secretRepository;
        this.#keyGenerator = keyGenerator;
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

        // 1. Generate the secure token
        const tokenVo = this.#keyGenerator.generate();
        const token = tokenVo.value();

        // 2. Derive dbKey and encryption key
        const { dbKey, encryptionKey } = CryptoService.deriveKeys(token);

        // 3. Encrypt the secret
        const { ciphertext, iv, tag } = CryptoService.encrypt(plaintextSecret, encryptionKey);

        // 4. Create and save Secret entity using dbKey as the identifier
        const dbKeyVo = new TokenVo(dbKey);
        const secret = Secret.create(dbKeyVo, ciphertext, iv, tag);
        await this.#secretRepository.save(secret);

        return { token, secret };
    }
}
