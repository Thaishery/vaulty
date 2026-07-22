import KeyGeneratorInterface from "../../Domain/Secrets/KeyGeneratorInterface.js";
import TokenVo from "../../Domain/Secrets/TokenVo.js";
import crypto from "crypto";

export class SecureTokenGenerator extends KeyGeneratorInterface {
    generate() {
        const token = crypto.randomBytes(32).toString('hex');
        return new TokenVo(token);
    }
}
