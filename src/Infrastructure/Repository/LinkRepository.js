import LinkRepositoryInterface from '../../Domain/links/LinkRepositoryInterface.js';
import Link from '../../Domain/links/Link.js';
import ShortCodeVo from '../../Domain/links/ShortCodeVo.js';
import OriginalUrlVo from '../../Domain/links/OriginalUrlVo.js';

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
            return new Link(new ShortCodeVo(shortCode), new OriginalUrlVo(this.#cache.get(shortCode)));
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
                resolve(new Link(new ShortCodeVo(shortCode), new OriginalUrlVo(row.original_url)));
            });
        });
    }

    async save(link) {
        return new Promise((resolve, reject) => {
            const stmt = this.#db.prepare('INSERT INTO urls (short_code, original_url) VALUES (?, ?)');
            stmt.run(link.shortCode.value(), link.originalUrl.value(), (err) => {
                if (err) {
                    return reject(err);
                }
                this.#cache.set(link.shortCode.value(), link.originalUrl.value());
                resolve();
            });
            stmt.finalize();
        });
    }
}
