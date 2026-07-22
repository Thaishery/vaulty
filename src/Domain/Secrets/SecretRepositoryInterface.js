import SecretLookupHash from "./SecretLookupHash.js";

export default class SecretRepositoryInterface {
    /**
     * @param {Secret} secret
     * @throws Error
     */
    async save(secret) {
        throw new Error("Method 'save(secret)' must be implemented.");
    }

    /**
     * @param {SecretLookupHash} lookupHash
     * @returns {Promise<Secret|null>}
     */
    async findByHash(lookupHash) {
        throw new Error("Method 'findByHash(lookupHash)' must be implemented.");
    }

    /**
     * @param {SecretLookupHash} lookupHash
     * @throws Error
     */
    async deleteByHash(lookupHash) {
        throw new Error("Method 'deleteByHash(lookupHash)' must be implemented.");
    }

    /**
     * Deletes secrets created before the specified cutoff date.
     * @param {Date} cutoffDate
     * @returns {Promise<number>} Number of deleted secrets
     */
    async deleteSecretsCreatedBefore(cutoffDate) {
        throw new Error("Method 'deleteSecretsCreatedBefore(cutoffDate)' must be implemented.");
    }
}
