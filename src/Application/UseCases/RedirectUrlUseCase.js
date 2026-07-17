import ShortCodeVo from '../../Domain/Links/ShortCodeVo.js';
import RedirectionPolicy from '../../Domain/Links/RedirectionPolicy.js';
import ClientAgentVo from '../../Domain/Links/ClientAgentVo.js';

export default class RedirectUrlUseCase {
    #linkRepository;

    constructor(linkRepository) {
        this.#linkRepository = linkRepository;
    }

    /**
     * Executes the redirect URL use case.
     * @param {string} shortCodeStr
     * @param {string} userAgent
     * @returns {Promise<{ link: Link|null, shouldRenderPreview: boolean }>}
     */
    async execute(shortCodeStr, userAgent) {
        const shortCodeVo = new ShortCodeVo(shortCodeStr);
        const clientAgentVo = new ClientAgentVo(userAgent);
        const link = await this.#linkRepository.retrieveLinkByShortCode(shortCodeVo);
        
        if (!link) {
            return { link: null, shouldRenderPreview: false };
        }

        const shouldRenderPreview = RedirectionPolicy.shouldRenderInstagramDiscordPreview(
            link.originalUrl,
            clientAgentVo
        );

        return { link, shouldRenderPreview };
    }
}
