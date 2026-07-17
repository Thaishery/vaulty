import DomainError from "../Errors/DomainError.js";

export default class OriginalUrlVo {
    constructor(originalUrl) {
        if (!originalUrl || typeof originalUrl !== 'string') {
            throw new DomainError(
                'URL is required and must be a string.',
                'URL_MISSING',
                'validation'
            );
        }
        if (originalUrl.length > 2048){
            throw new DomainError(
                'URL length cannot exceed 2048 characters.',
                'URL_TOO_LONG',
                'validation'
            );
        }
        let parsedUrl; 
        try {
            parsedUrl = new URL(originalUrl);
        } catch (_) {
            throw new DomainError(
                'Invalid URL format.',
                'URL_INVALID',
                'validation'
            );
        }
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            throw new DomainError(
                'Only http and https protocols are supported.',
                'URL_INVALID_PROTOCOL',
                'validation'
            );
        }
        this.originalUrl = originalUrl;
        Object.freeze(this);
    }

    value() {
        return this.originalUrl;
    }
}