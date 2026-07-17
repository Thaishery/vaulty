const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

export class Firewall {
    #rateLimits = new Map();
    //TODO : policies? 
    checkRateLimit(ip) {
        const now = Date.now();
        if (!this.#rateLimits.has(ip)) {
            this.#rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
            return false;
        }

        const limit = this.#rateLimits.get(ip);
        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + RATE_LIMIT_WINDOW_MS;
            return false;
        }

        limit.count++;
        return limit.count > MAX_REQUESTS_PER_WINDOW;
    }
}