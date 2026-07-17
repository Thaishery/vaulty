import KeyGeneratorInterface from "../../Domain/Links/KeyGeneratorInterface.js";
import ShortCodeVo from "../../Domain/Links/ShortCodeVo.js";

export class TimeBasedKeyGenerator extends KeyGeneratorInterface {
    #counter = 0;

    generate() {
        const ns = process.hrtime.bigint();
        const key = (ns + BigInt(this.#counter++)).toString(36);
        return new ShortCodeVo(key);
    }
}
