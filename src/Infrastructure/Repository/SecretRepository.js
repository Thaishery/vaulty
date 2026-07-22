import SecretRepositoryInterface from '../../Domain/Secrets/SecretRepositoryInterface.js';
import Secret from '../../Domain/Secrets/Secret.js';
import TokenVo from '../../Domain/Secrets/TokenVo.js';

export default class SecretRepository extends SecretRepositoryInterface {
    #db;

    constructor(db) {
        super();
        this.#db = db;
    }

    async retrieveSecretByDbKey(dbKeyVo) {
        if (!(dbKeyVo instanceof TokenVo)) {
            throw new Error('dbKeyVo must be a TokenVo instance');
        }
        const dbKey = dbKeyVo.value();

        return new Promise((resolve, reject) => {
            this.#db.get(
                `SELECT encrypted_content, iv, auth_tag FROM secrets WHERE id = ?`,
                [dbKey],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return resolve(null);
                    }
                    resolve(new Secret(
                        dbKeyVo,
                        row.encrypted_content,
                        row.iv,
                        row.auth_tag
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
                secret.id.value(),
                secret.encryptedContent,
                secret.iv,
                secret.authTag,
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

    async delete(dbKeyVo) {
        if (!(dbKeyVo instanceof TokenVo)) {
            throw new Error('dbKeyVo must be a TokenVo instance');
        }
        const dbKey = dbKeyVo.value();
        await this.#db.run('DELETE FROM secrets WHERE id = ?', [dbKey]);
    }
}
