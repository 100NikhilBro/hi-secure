import rateLimit from "express-rate-limit";
import { HiSecureConfig } from "../core/config";

export class ExpressRLAdapter {
    private limiter: any;

    constructor(config: HiSecureConfig["rateLimiter"]) {
        this.limiter = rateLimit({
            windowMs: config.windowMs,
            max: config.maxRequests,
            message: config.message
        });
    }

    getMiddleware() {
        return this.limiter;
    }
}
