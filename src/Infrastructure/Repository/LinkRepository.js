import LinkRepositoryInterface from '../../Domain/Links/LinkRepositoryInterface.js';
import Link from '../../Domain/Links/Link.js';
import ShortCodeVo from '../../Domain/Links/ShortCodeVo.js';
import OriginalUrlVo from '../../Domain/Links/OriginalUrlVo.js';

export default class LinkRepository extends LinkRepositoryInterface {
    #db;

    constructor(db) {
        super();
        this.#db = db;
    }

    async retrieveLinkByShortCode(shortCodeVo) {
        if (!(shortCodeVo instanceof ShortCodeVo)) {
            throw new Error('shortCodeVo must be a ShortCodeVo instance');
        }
        const shortCode = shortCodeVo.value();

        return new Promise((resolve, reject) => {
            this.#db.get(`SELECT original_url FROM urls WHERE short_code = ?`, [shortCode], (err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(null);
                }
                resolve(new Link(shortCodeVo, new OriginalUrlVo(row.original_url)));
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
                resolve();
            });
            stmt.finalize();
        });
    }
}
