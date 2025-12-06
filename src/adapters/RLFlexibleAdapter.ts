
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError";

export class RLFlexibleAdapter {

    /**
     * Create middleware dynamically using options.
     */
    getMiddleware(options: {
        points?: number;
        duration?: number; // seconds
        message?: any;
    } = {}) {

        try {
            const limiter = new RateLimiterMemory({
                points: options.points ?? 100,
                duration: options.duration ?? 60,
            });

            return async (req: any, res: any, next: any) => {
                const ip = req.ip ||
                           req.headers["x-forwarded-for"] ||
                           req.connection?.remoteAddress ||
                           "unknown";

                try {
                    await limiter.consume(ip);
                    next();
                } catch (err: any) {
                    const rlErr = err as RateLimiterRes;

                    logger.warn("⚠ RLFlexibleAdapter: rate limit exceeded", {
                        ip,
                        path: req.path,
                        method: req.method,
                        retryAfter: rlErr.msBeforeNext
                    });

                    return res.status(429).json({
                        success: false,
                        error: "RATE_LIMIT_EXCEEDED",
                        retryAfter: Math.ceil(rlErr.msBeforeNext / 1000),
                        message: options.message ?? "Too many requests, slow down."
                    });
                }
            };

        } catch (err: any) {
            logger.error("❌ RLFlexibleAdapter: failed to initialize limiter", {
                error: err?.message || err
            });
            throw new AdapterError("RateLimiterFlexible creation failed.");
        }
    }
}
