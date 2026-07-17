export default class ShortenUrlUseCase {
    #linkRepository;
    #linkFactory;

    constructor(linkRepository, linkFactory) {
        this.#linkRepository = linkRepository;
        this.#linkFactory = linkFactory;
    }

    /**
     * @param {string} originalUrl
     * @returns {Promise<Link>}
     */
    async execute(originalUrl) {
        const link = this.#linkFactory.create(originalUrl);
        await this.#linkRepository.save(link);
        return link;
    }
}