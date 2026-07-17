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
     * @returns {Promise<Link>}
     */
    async execute(originalUrl) {
        const shortCode = this.#keyGenerator.generate();
        const link = Link.create(shortCode, originalUrl);
        await this.#linkRepository.save(link);
        return link;
    }
}