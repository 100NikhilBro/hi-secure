import rateLimit from "express-rate-limit";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError";

export class ExpressRLAdapter {

    /**
     * Create express rate-limit middleware dynamically
     */
    getMiddleware(options: {
        windowMs?: number;
        max?: number;
        message?: any;
    } = {}) {

        try {
            const limiter = rateLimit({
                windowMs: options.windowMs ?? 15 * 60 * 1000, // default
                max: options.max ?? 100,
                message: options.message ?? { error: "Too many requests" },
                standardHeaders: true,
                legacyHeaders: false,
            });

            return limiter;

        } catch (err: any) {
            logger.error("❌ ExpressRLAdapter: failed to create limiter", {
                error: err?.message || err
            });
            throw new AdapterError("Express rate limiter creation failed.");
        }
    }
}
