import rateLimit from "express-rate-limit";
import { HiSecureConfig } from "../core/config";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError";

export class ExpressRLAdapter {
    private limiter: ReturnType<typeof rateLimit>;

    constructor(config: HiSecureConfig["rateLimiter"]) {
        try {
            this.limiter = rateLimit({
                windowMs: config.windowMs,
                max: config.maxRequests,
                message: { error: config.message }, // ⭐ safer message object
                standardHeaders: true,
                legacyHeaders: false
            });

            logger.info("🚦 Express rate limiter initialized", {
                windowMs: config.windowMs,
                maxRequests: config.maxRequests
            });

        } catch (err: any) {
            logger.error("❌ Failed to initialize Express rate limiter", {
                error: err?.message || err
            });
            throw new AdapterError("Express rate limiter initialization failed.");
        }
    }

    getMiddleware() {
        if (!this.limiter) {
            logger.error("❌ Rate limiter middleware requested but limiter not initialized.");
            throw new AdapterError("Rate limiter not initialized.");
        }

        return this.limiter;
    }
}
