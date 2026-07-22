import AccessSecretToken from "./AccessSecretToken.js";

export default class KeyGeneratorInterface {
    /**
     * @returns {AccessSecretToken}
     */
    generate() {
        throw new Error("Method 'generate()' must be implemented.");
    }
}
