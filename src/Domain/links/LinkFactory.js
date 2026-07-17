import Link from "./Link.js";
import OriginalUrlVo from "./OriginalUrlVo.js";
import ShortCodeVo from "./ShortCodeVo.js";

export default class LinkFactory {
    #keyGenerator;

    constructor(keyGenerator) {
        this.#keyGenerator = keyGenerator;
    }

    create(originalUrl) {
        try{
            const originalUrlVo = new OriginalUrlVo(originalUrl);
            const shortCodeVo = new ShortCodeVo(this.#keyGenerator.generate());
            return new Link(shortCodeVo, originalUrlVo);
        }catch(e){
            //TODO gestion erreur ici. 
            console.log('Link Factory caught an error: ')
            console.log(e);
            console.log('LinkFactory will rethrow the error')
            throw e;
        }
    }
}