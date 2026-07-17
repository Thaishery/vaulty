import ClientAgentVo from './ClientAgentVo.js';

export default class RedirectionPolicy {
    /**
     * Determine if the redirection should render a special Instagram preview page for Discordbot.
     * @param {OriginalUrlVo} originalUrl
     * @param {ClientAgentVo} clientAgentVo
     * @returns {boolean}
     */
    static shouldRenderInstagramDiscordPreview(originalUrl, clientAgentVo) {
        if (!(clientAgentVo instanceof ClientAgentVo)) {
            throw new Error('clientAgentVo must be an instance of ClientAgentVo');
        }
        const urlStr = originalUrl.value();
        return urlStr.includes("//www.instagram.com/") && clientAgentVo.isDiscordBot();
    }
}
