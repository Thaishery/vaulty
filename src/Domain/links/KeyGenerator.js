export class KeyGenerator {
    #counter = 0;

    generate() {
        const ns = process.hrtime.bigint();
        const key = (ns + BigInt(this.#counter++)).toString(36);
        return key;
    }
}
