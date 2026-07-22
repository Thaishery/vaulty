export default class KeyGeneratorInterface {
    /**
     * @returns {TokenVo}
     */
    generate() {
        throw new Error("Method 'generate()' must be implemented.");
    }
}
