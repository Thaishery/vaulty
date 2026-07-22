import DomainError from "../Errors/DomainError.js";

export default class SecretTTL {
    #days;

    constructor(days = 365) {
        if (typeof days !== 'number' || !Number.isInteger(days) || days <= 0) {
            throw new DomainError(
                'TTL days must be a positive integer.',
                'TTL_INVALID',
                'validation'
            );
        }
        this.#days = days;
        Object.freeze(this);
    }

    get days() {
        return this.#days;
    }

    /**
     * Calculates the cutoff Date before which a secret is considered expired.
     * @param {Date} now
     * @returns {Date}
     */
    calculateCutoffDate(now = new Date()) {
        const msInDay = 24 * 60 * 60 * 1000;
        return new Date(now.getTime() - (this.#days * msInDay));
    }

    /**
     * Checks whether a secret created at createdAt date is expired.
     * @param {Date} createdAt
     * @param {Date} now
     * @returns {boolean}
     */
    isExpired(createdAt, now = new Date()) {
        const parsedDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
        if (isNaN(parsedDate.getTime())) {
            return true;
        }
        const cutoffDate = this.calculateCutoffDate(now);
        return parsedDate.getTime() < cutoffDate.getTime();
    }

    equals(other) {
        if (!(other instanceof SecretTTL)) return false;
        return this.days === other.days;
    }

    static default() {
        return new SecretTTL(365);
    }
}
