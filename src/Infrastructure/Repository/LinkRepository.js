import LinkRepositoryInterface from '../../Domain/links/LinkRepositoryInterface.js';
import Link from '../../Domain/links/Link.js';

export default class LinkRepository extends LinkRepositoryInterface {
    #db;
    #cache;

    constructor(db, cache) {
        super();
        this.#db = db;
        this.#cache = cache;
    }

    async retrieveLinkByShortCode(shortCode) {
        if (this.#cache.has(shortCode)) {
            return new Link(shortCode, this.#cache.get(shortCode));
        }

        return new Promise((resolve, reject) => {
            this.#db.get(`SELECT original_url FROM urls WHERE short_code = ?`, [shortCode], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(null);
                }
                this.#cache.set(shortCode, row.original_url);

                resolve(new Link(shortCode, row.original_url));
            });
        });
    }
}
