import { RateLimiterMemory } from "rate-limiter-flexible";
import { HiSecureConfig } from "../core/config";

export class RLFlexibleAdapter {
    private limiter: RateLimiterMemory;

    constructor(config: HiSecureConfig["rateLimiter"]) {
        this.limiter = new RateLimiterMemory({
            points: config.maxRequests,          // max requests
            duration: config.windowMs / 1000     // convert ms → seconds
        });
    }

    getMiddleware() {
        return async (req: any, res: any, next: any) => {
            try {
                await this.limiter.consume(req.ip);
                next();
            } catch {
                res.status(429).json({
                    message: "Too many requests, please try again later."
                });
            }
        };
    }
}
