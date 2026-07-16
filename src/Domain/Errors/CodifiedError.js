export default class CodifiedError extends Error {
    constructor(message, code, category = 'validation') {
        super(message);
        this.name = 'CodifiedError';
        this.code = code;             // ex: 'URL_TOO_LONG'
        this.category = category;     // ex: 'business_rule', 'type_check', 'parsing'
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

    }
}