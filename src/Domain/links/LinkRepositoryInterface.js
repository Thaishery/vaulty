export default class LinkRepositoryInterface {
    /**
     * @param {string} shortCode
     * @returns {Promise<Link|null>}
     */
    async retrieveLinkByShortCode(shortCode) {
        throw new Error("Method 'retrieveLinkByShortCode(shortCode)' must be implemented.");
    }

    /**
     * @param {Link} link
     * @throws DatabaseError
     * @throws CacheError
     * @throws Error
     */
    async save(link) {
        throw new Error("Method 'save(link)' must be implemented.");
    }
}
