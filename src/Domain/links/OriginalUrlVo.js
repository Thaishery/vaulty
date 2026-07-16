export default class OriginalUrlVo {
    constructor(originalUrl) {
        if (!originalUrl || typeof originalUrl !== 'string') {
            throw new Error('URL is required and must be a string.');
        }
        if (originalUrl.length > 2048){
            throw new Error('URL length cannot exceed 2048 characters.');
        }
        let parsedUrl; 
        try {
            parsedUrl = new URL(originalUrl);
        } catch (_) {
            throw new Error('Invalid URL format.');
        }
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            throw new Error('Only http and https protocols are supported.');
        }
        this.originalUrl = originalUrl;
        Object.freeze(this);
    }

    value() {
        return this.originalUrl;
    }
}