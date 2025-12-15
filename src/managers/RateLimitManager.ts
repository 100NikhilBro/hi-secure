import { HiSecureConfig } from "../core/types/HiSecureConfig.js";
import { AdapterError } from "../core/errors/AdapterError.js";
import { logger } from "../logging";

interface RateLimiterAdapter {
    getMiddleware: (options?: any) => any;
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

    middleware(opts?: { mode?: "strict" | "relaxed" | "api"; options?: any }) {
        let finalOptions: any = {};

        if (opts?.mode === "strict") {
            finalOptions = {
                windowMs: 10_000,
                max: 5,
                message: "Too many requests, please slow down."
            };
        } else if (opts?.mode === "relaxed") {
            finalOptions = {
                windowMs: 60_000,
                max: 100,
                message: "Rate limit exceeded."
            };
        } else if (opts?.mode === "api") {
            finalOptions = {
                windowMs: 15 * 60 * 1000, 
                max: 100,
                message: "API rate limit exceeded."
            };
        } else {
            finalOptions = {
                windowMs: this.config.windowMs,
                max: this.config.maxRequests,
                message: this.config.message,
                standardHeaders: true,      
                legacyHeaders: false        
            };
        }

        if (opts?.options) {
            const allowedOverrides = ['message', 'skipFailedRequests', 'standardHeaders', 'legacyHeaders'];
            for (const key of allowedOverrides) {
                if (opts.options[key] !== undefined) {
                    finalOptions[key] = opts.options[key];
                }
            }
            
            const attemptedOverrides = Object.keys(opts.options).filter(
                k => !allowedOverrides.includes(k) && k !== 'mode'
            );
            if (attemptedOverrides.length > 0) {
                logger.warn("Rate limit overrides ignored", {
                    preset: opts?.mode || 'default',
                    ignoredOptions: attemptedOverrides
                });
            }
        }

        if (finalOptions.standardHeaders === undefined) {
            finalOptions.standardHeaders = true;
        }
        if (finalOptions.legacyHeaders === undefined) {
            finalOptions.legacyHeaders = false;
        }

        try {
            logger.info("Applying rate limiting", {
                mode: opts?.mode || 'default',
                windowMs: finalOptions.windowMs,
                max: finalOptions.max
            });
            
            return this.primaryAdapter.getMiddleware(finalOptions);
        } catch (err: any) {
            logger.warn("Primary rate limiter failed → fallback", {
                error: err?.message
            });

            if (!this.fallbackAdapter) {
                throw new AdapterError("Rate limiters failed; no fallback adapter.");
            }

            try {
                logger.info("Using fallback rate limiter");
                return this.fallbackAdapter.getMiddleware(finalOptions);
            } catch (fallbackErr: any) {
                logger.error("Fallback limiter also failed", {
                    error: fallbackErr?.message
                });
                throw new AdapterError("Both primary and fallback limiters failed.");
            }
        }
    }
}