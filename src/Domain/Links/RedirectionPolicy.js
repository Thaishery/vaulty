export default class RedirectionPolicy {
    /**
     * Determine if the redirection should render a special Instagram preview page for Discordbot.
     * @param {OriginalUrlVo} originalUrl
     * @param {string} userAgent
     * @returns {boolean}
     */
    static shouldRenderInstagramDiscordPreview(originalUrl, userAgent) {
        const urlStr = originalUrl.value();
        return urlStr.includes("//www.instagram.com/") && userAgent.includes("Discordbot");
    }
}
