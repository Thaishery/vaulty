export default class RedirectDto {
    constructor(url, statusCode = 308, headers = {}) {
        if (!url) {
            throw new Error('Url is required');
        }
        this.statusCode = statusCode;
        this.headers = headers;
        this.headers['Location'] = url;
    }
}
