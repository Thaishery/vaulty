import ShortCodeVo from './ShortCodeVo.js';

export default class KeyGeneratorInterface {
    /**
     * @returns {ShortCodeVo}
     */
    generate() {
        throw new Error("Method 'generate()' must be implemented.");
    }
}
