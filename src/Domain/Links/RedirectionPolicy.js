import ClientAgentVo from './ClientAgentVo.js';

export default class RedirectionPolicy {
    /**
     * Determine if the redirection should render a special preview page for scrapers.
     * @param {Link} link
     * @param {ClientAgentVo} clientAgentVo
     * @returns {boolean}
     */
    static shouldRenderPreview(link, clientAgentVo) {
        if (!(clientAgentVo instanceof ClientAgentVo)) {
            throw new Error('clientAgentVo must be an instance of ClientAgentVo');
        }
        return clientAgentVo.isScraperBot();
    }
}
