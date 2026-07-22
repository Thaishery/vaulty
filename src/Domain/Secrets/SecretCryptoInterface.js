export default class SecretCryptoInterface {
    /**
     * Derives a database lookup key (hash) and encryption key from an access token.
     * @param {string} token - The raw URL token
     * @returns {{ dbKey: string, encryptionKey: Uint8Array }}
     */
    deriveKeys(token) {
        throw new Error("Method 'deriveKeys(token)' must be implemented.");
    }

    /**
     * Encrypts plaintext using the derived key.
     * @param {string} plaintext 
     * @param {Uint8Array} key 
     * @returns {{ ciphertext: string, iv: string, tag: string }}
     */
    encrypt(plaintext, key) {
        throw new Error("Method 'encrypt(plaintext, key)' must be implemented.");
    }

    /**
     * Decrypts ciphertext using the derived key, iv and tag.
     * @param {string} ciphertext 
     * @param {Uint8Array} key 
     * @param {string} iv 
     * @param {string} tag 
     * @returns {string} - Plaintext
     */
    decrypt(ciphertext, key, iv, tag) {
        throw new Error("Method 'decrypt(ciphertext, key, iv, tag)' must be implemented.");
    }
}

