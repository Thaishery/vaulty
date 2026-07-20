import Link from '../../Domain/Links/Link.js';

export default class ShortenUrlUseCase {
    #linkRepository;
    #keyGenerator;

    constructor(linkRepository, keyGenerator) {
        this.#linkRepository = linkRepository;
        this.#keyGenerator = keyGenerator;
    }

    /**
     * @param {string} originalUrl
     * @param {string|null} ogTitle
     * @param {string|null} ogDescription
     * @param {string|null} ogImageUrl
     * @returns {Promise<Link>}
     */
    async execute(originalUrl, ogTitle = null, ogDescription = null, ogImageUrl = null) {
        const shortCodeVo = this.#keyGenerator.generate();
        const link = Link.create(shortCodeVo, originalUrl, ogTitle, ogDescription, ogImageUrl);
        await this.#linkRepository.save(link);
        return link;
    }
}