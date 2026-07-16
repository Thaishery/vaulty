import CodifiedError from "./CodifiedError.js";

export default class DomainError extends CodifiedError {
    constructor(message, code, category = 'validation') {
        super(message, code, category);
        this.name = 'DomainError';
        Object.freeze(this);
    }
}
