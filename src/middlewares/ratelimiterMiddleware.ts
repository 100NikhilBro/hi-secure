import { RateLimitManager } from "../managers/RateLimitManager";

export function rateLimiterMiddleware(manager: RateLimitManager) {
    return manager.middleware();
}
