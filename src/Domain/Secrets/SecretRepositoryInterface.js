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
}
