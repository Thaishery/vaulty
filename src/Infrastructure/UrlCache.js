export default class UrlCache {
    #map;

    constructor() {
        this.#map = new Map();
    }

    get(key) {
        return this.#map.get(key);
    }

    set(key, value) {
        this.#map.set(key, value);
    }

    has(key) {
        return this.#map.has(key);
    }

    delete(key) {
        this.#map.delete(key);
    }

    clear() {
        this.#map.clear();
    }
}