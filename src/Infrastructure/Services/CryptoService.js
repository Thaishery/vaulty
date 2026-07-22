import crypto from 'crypto';

export class CryptoService {
    /**
     * Derives a database lookup key (hash) and encryption key from a high-entropy token.
     * @param {string} token - The raw URL token
     * @returns {{ dbKey: string, encryptionKey: Buffer }}
     */
    static deriveKeys(token) {
        const dbKeyBuffer = Buffer.from(crypto.hkdfSync('sha256', token, '', 'vaulty-db-key', 32));
        const dbKey = dbKeyBuffer.toString('hex');
        const encryptionKey = Buffer.from(crypto.hkdfSync('sha256', token, '', 'vaulty-encryption-key', 32));
        return { dbKey, encryptionKey };
    }

    /**
     * Encrypts plaintext using the derived key.
     * @param {string} plaintext 
     * @param {Buffer} key 
     * @returns {{ ciphertext: string, iv: string, tag: string }} - Hex encoded outputs
     */
    static encrypt(plaintext, key) {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return {
            ciphertext: encrypted.toString('hex'),
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
    }

    /**
     * Decrypts ciphertext using the derived key, iv and tag.
     * @param {string} ciphertext - Hex encoded ciphertext
     * @param {Buffer} key - Derived encryption key
     * @param {string} iv - Hex encoded IV
     * @param {string} tag - Hex encoded Auth Tag
     * @returns {string} - Plaintext
     */
    static decrypt(ciphertext, key, iv, tag) {
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]);
        return decrypted.toString('utf8');
    }
}
