export default class LinkRepositoryInterface {
    /**
     * @param {string} shortCode
     * @returns {Promise<Link|null>}
     */
    async retrieveLinkByShortCode(shortCode) {
        throw new Error("Method 'retrieveLinkByShortCode(shortCode)' must be implemented.");
    }
}
