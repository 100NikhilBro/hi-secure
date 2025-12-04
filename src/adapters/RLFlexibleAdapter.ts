import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { HiSecureConfig } from "../core/config";
import { logger } from "../logging";

export class RLFlexibleAdapter {
    private limiter: RateLimiterMemory;

    constructor(config: HiSecureConfig["rateLimiter"]) {
        this.limiter = new RateLimiterMemory({
            points: config.maxRequests,            // Max requests allowed
            duration: config.windowMs / 1000       // Convert ms → seconds
        });
    }

    getMiddleware() {
        return async (req: any, res: any, next: any) => {
            // ⭐ Best way to detect IP – Express provides trust proxy safe value
            const ip =
                req.ip ||
                req.headers["x-forwarded-for"] ||
                req.connection?.remoteAddress ||
                "unknown";

            try {
                await this.limiter.consume(ip);
                next();
            } catch (rateLimitErr: any) {
                const rlError = rateLimitErr as RateLimiterRes;

                logger.warn("⚠ Rate limit exceeded", {
                    ip,
                    path: req.path,
                    method: req.method,
                    remainingPoints: rlError.remainingPoints,
                    msBeforeNext: rlError.msBeforeNext
                });

                return res.status(429).json({
                    success: false,
                    error: "RATE_LIMIT_EXCEEDED",
                    message: "Too many requests, please try again later.",
                    retryAfter: Math.ceil(rlError.msBeforeNext / 1000)
                });
            }
        };
    }
}
