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
            this.#db.get(
                `SELECT original_url, og_title, og_description, og_image_url FROM links WHERE short_code = ?`,
                [shortCode],
                (err, row) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!row) {
                        return resolve(null);
                    }
                    resolve(new Link(
                        shortCodeVo,
                        new OriginalUrlVo(row.original_url),
                        row.og_title,
                        row.og_description,
                        row.og_image_url
                    ));
                }
            );
        });
    }

    async save(link) {
        return new Promise((resolve, reject) => {
            const stmt = this.#db.prepare(
                'INSERT INTO links (short_code, original_url, og_title, og_description, og_image_url) VALUES (?, ?, ?, ?, ?)'
            );
            stmt.run(
                link.shortCode.value(),
                link.originalUrl.value(),
                link.ogTitle,
                link.ogDescription,
                link.ogImageUrl,
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
}
