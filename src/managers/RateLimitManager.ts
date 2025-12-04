import { HiSecureConfig } from "../core/config";
import { AdapterError } from "../core/errors/AdapterError";
import { logger } from "../logging";

interface RateLimiterAdapter {
    getMiddleware: () => any;
}

export class RateLimitManager {
    private config: HiSecureConfig["rateLimiter"];
    private primaryAdapter: RateLimiterAdapter;
    private fallbackAdapter: RateLimiterAdapter | null;

    constructor(
        config: HiSecureConfig["rateLimiter"],
        primaryAdapter: RateLimiterAdapter,
        fallbackAdapter: RateLimiterAdapter | null
    ) {
        this.config = config;
        this.primaryAdapter = primaryAdapter;
        this.fallbackAdapter = fallbackAdapter;
    }

    /**
     * Returns middleware from primary adapter.
     * Fallback is used if primary adapter fails.
     */
    middleware() {
        try {
            logger.info("📌 RateLimiter: Using primary adapter");
            return this.primaryAdapter.getMiddleware();

        } catch (err: any) {
            logger.warn("⚠ Primary RateLimiter adapter failed → switching to fallback", {
                error: err?.message
            });

            if (!this.fallbackAdapter) {
                throw new AdapterError(
                    "RateLimiter failed and fallback adapter is not configured."
                );
            }

            try {
                logger.info("📌 RateLimiter: Using fallback adapter");
                return this.fallbackAdapter.getMiddleware();

            } catch (fallbackErr: any) {
                logger.error("❌ Fallback RateLimiter adapter also failed", {
                    error: fallbackErr?.message
                });

                throw new AdapterError(
                    "Both primary and fallback RateLimiter adapters failed."
                );
            }
        }
    }
}
