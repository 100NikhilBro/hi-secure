import { HiSecureConfig } from "../core/config";

export class RateLimitManager {
    private config: HiSecureConfig["rateLimiter"];
    private primaryAdapter: any;
    private fallbackAdapter: any;

    constructor(config: HiSecureConfig["rateLimiter"], primaryAdapter: any, fallbackAdapter: any) {
        this.config = config;
        this.primaryAdapter = primaryAdapter;
        this.fallbackAdapter = fallbackAdapter;
    }

    /**
     * Returns a middleware function depending on the adapter
     */
    middleware() {
    try {
        return this.primaryAdapter.getMiddleware();
    } catch (err) {
        console.warn("⚠ RateLimiter primary adapter failed → using fallback.");
        return this.fallbackAdapter?.getMiddleware();
    }
}
}
