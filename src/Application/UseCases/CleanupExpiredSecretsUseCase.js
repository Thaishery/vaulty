import SecretTTL from '../../Domain/Secrets/SecretTTL.js';

export default class CleanupExpiredSecretsUseCase {
    #secretRepository;

    constructor(secretRepository) {
        this.#secretRepository = secretRepository;
    }

    /**
     * Purges expired secrets from the database based on retention policy (TTL).
     * @param {SecretTTL|number} [ttl] - Retention policy or TTL in days (default: 365 days)
     * @returns {Promise<number>} - Number of deleted secrets
     */
    async execute(ttl = SecretTTL.default()) {
        try {
            const activeTtl = ttl instanceof SecretTTL ? ttl : new SecretTTL(ttl);
            const cutoffDate = activeTtl.calculateCutoffDate();
            const count = await this.#secretRepository.deleteSecretsCreatedBefore(cutoffDate);
            if (count > 0) {
                console.log(`[CleanupExpiredSecrets] Successfully purged ${count} expired secret(s) created before ${cutoffDate.toISOString()}.`);
            }
            return count;
        } catch (err) {
            console.error('[CleanupExpiredSecrets] Error during secret cleanup:', err.message || err);
            return 0;
        }
    }
}
