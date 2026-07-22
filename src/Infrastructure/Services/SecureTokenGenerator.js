import KeyGeneratorInterface from "../../Domain/Secrets/KeyGeneratorInterface.js";
import AccessSecretToken from "../../Domain/Secrets/AccessSecretToken.js";
import crypto from "crypto";

export class SecureTokenGenerator extends KeyGeneratorInterface {
    generate() {
        const token = crypto.randomBytes(32).toString('hex');
        return new AccessSecretToken(token);
    }
}
