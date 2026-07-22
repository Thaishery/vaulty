export default class SecretRepositoryInterface {
    /**
     * @param {Secret} secret
     * @throws Error
     */
    async save(secret) {
        throw new Error("Method 'save(secret)' must be implemented.");
    }

    /**
     * @param {TokenVo} dbKeyVo
     * @returns {Promise<Secret|null>}
     */
    async retrieveSecretByDbKey(dbKeyVo) {
        throw new Error("Method 'retrieveSecretByDbKey(dbKeyVo)' must be implemented.");
    }

    /**
     * @param {TokenVo} dbKeyVo
     * @throws Error
     */
    async delete(dbKeyVo) {
        throw new Error("Method 'delete(dbKeyVo)' must be implemented.");
    }

    /**
     * Deletes secrets older than maxAgeDays.
     * @param {number} maxAgeDays
     * @returns {Promise<number>} Number of deleted secrets
     */
    async deleteExpiredSecrets(maxAgeDays = 365) {
        throw new Error("Method 'deleteExpiredSecrets(maxAgeDays)' must be implemented.");
    }
}
