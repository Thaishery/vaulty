import SecretRepositoryInterface from '../../Domain/Secrets/SecretRepositoryInterface.js';
import Secret from '../../Domain/Secrets/Secret.js';
import SecretLookupHash from '../../Domain/Secrets/SecretLookupHash.js';
import EncryptedPayload from '../../Domain/Secrets/EncryptedPayload.js';

export default class SecretRepository extends SecretRepositoryInterface {
    #db;

    constructor(db) {
        super();
        this.#db = db;
    }

    async findByHash(lookupHash) {
        if (!(lookupHash instanceof SecretLookupHash)) {
            throw new Error('lookupHash must be a SecretLookupHash instance');
        }
        const dbKey = lookupHash.value();

        return new Promise((resolve, reject) => {
            this.#db.get(
                `SELECT encrypted_content, iv, auth_tag, created_at FROM secrets WHERE id = ?`,
                [dbKey],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return resolve(null);
                    }
                    const payload = new EncryptedPayload(
                        row.encrypted_content,
                        row.iv,
                        row.auth_tag
                    );
                    const createdAt = row.created_at ? new Date(row.created_at) : new Date();
                    resolve(new Secret(
                        lookupHash,
                        payload,
                        createdAt
                    ));
                }
            );
        });
    }

    async save(secret) {
        if (!(secret instanceof Secret)) {
            throw new Error('secret must be a Secret instance');
        }
        return new Promise((resolve, reject) => {
            const stmt = this.#db.prepare(
                'INSERT INTO secrets (id, encrypted_content, iv, auth_tag) VALUES (?, ?, ?, ?)'
            );
            stmt.run(
                secret.lookupHash.value(),
                secret.encryptedPayload.ciphertext,
                secret.encryptedPayload.iv,
                secret.encryptedPayload.authTag,
                (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }
            );
            stmt.finalize();
        });
    }

    async deleteByHash(lookupHash) {
        if (!(lookupHash instanceof SecretLookupHash)) {
            throw new Error('lookupHash must be a SecretLookupHash instance');
        }
        const dbKey = lookupHash.value();
        await this.#db.run('DELETE FROM secrets WHERE id = ?', [dbKey]);
    }

    async deleteSecretsCreatedBefore(cutoffDate) {
        const dateObj = cutoffDate instanceof Date ? cutoffDate : new Date(cutoffDate);
        if (isNaN(dateObj.getTime())) {
            throw new Error('cutoffDate must be a valid Date instance');
        }
        // Format as SQLite UTC timestamp string: "YYYY-MM-DD HH:MM:SS"
        const formattedDate = dateObj.toISOString().replace('T', ' ').substring(0, 19);
        const result = await this.#db.run(
            `DELETE FROM secrets WHERE created_at < ?`,
            [formattedDate]
        );
        return result?.changes || 0;
    }

    async deleteExpiredSecrets(maxAgeDays = 365) {
        const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
        return this.deleteSecretsCreatedBefore(cutoffDate);
    }
}

