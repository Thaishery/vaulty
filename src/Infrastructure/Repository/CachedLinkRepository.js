import LinkRepositoryInterface from '../../Domain/Links/LinkRepositoryInterface.js';
import Link from '../../Domain/Links/Link.js';
import OriginalUrlVo from '../../Domain/Links/OriginalUrlVo.js';

export default class CachedLinkRepository extends LinkRepositoryInterface {
    #innerRepository;
    #cache;

    constructor(innerRepository, cache) {
        super();
        this.#innerRepository = innerRepository;
        this.#cache = cache;
    }

    async retrieveLinkByShortCode(shortCodeVo) {
        const shortCode = shortCodeVo.value();
        if (this.#cache.has(shortCode)) {
            const cached = this.#cache.get(shortCode);
            return new Link(
                shortCodeVo,
                new OriginalUrlVo(cached.originalUrl),
                cached.ogTitle,
                cached.ogDescription,
                cached.ogImageUrl
            );
        }

        const link = await this.#innerRepository.retrieveLinkByShortCode(shortCodeVo);
        if (link) {
            this.#cache.set(shortCode, {
                originalUrl: link.originalUrl.value(),
                ogTitle: link.ogTitle,
                ogDescription: link.ogDescription,
                ogImageUrl: link.ogImageUrl
            });
        }
        return link;
    }

    async save(link) {
        await this.#innerRepository.save(link);
        this.#cache.set(link.shortCode.value(), {
            originalUrl: link.originalUrl.value(),
            ogTitle: link.ogTitle,
            ogDescription: link.ogDescription,
            ogImageUrl: link.ogImageUrl
        });
    }
}
