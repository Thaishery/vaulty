export default class CleanupExpiredSecretsUseCase {
    #secretRepository;

    constructor(secretRepository) {
        this.#secretRepository = secretRepository;
    }

    /**
     * Purges expired secrets from the database.
     * @param {number} maxAgeDays - Age threshold in days (default: 365)
     * @returns {Promise<number>} - Number of deleted secrets
     */
    async execute(maxAgeDays = 365) {
        try {
            const count = await this.#secretRepository.deleteExpiredSecrets(maxAgeDays);
            if (count > 0) {
                console.log(`[CleanupExpiredSecrets] Successfully purged ${count} expired secret(s) older than ${maxAgeDays} day(s).`);
            }
            return count;
        } catch (err) {
            console.error('[CleanupExpiredSecrets] Error during secret cleanup:', err.message || err);
            return 0;
        }
    }
}
