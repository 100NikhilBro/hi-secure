// src/managers/RateLimitManager.ts
import { HiSecureConfig } from "../core/config";
import { AdapterError } from "../core/errors/AdapterError";
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

    middleware(opts?: { mode?: "strict" | "relaxed" | undefined; options?: any }) {
        let final: any = {};

        // ---------------------------
        // MODE PRESETS
        // ---------------------------
        if (opts?.mode === "strict") {
            final = {
                windowMs: 10_000,
                max: 5,
                points: 5,
                duration: 10
            };
        }

        if (opts?.mode === "relaxed") {
            final = {
                windowMs: 60_000,
                max: 100,
                points: 100,
                duration: 60
            };
        }

        // ---------------------------
        // CUSTOM OPTIONS
        // ---------------------------
        if (opts?.options) {
            final = { ...final, ...opts.options };
        }

        // ---------------------------
        // DEFAULT OPTIONS (opts undefined)
        // ---------------------------
        if (!opts) {
            final = {
                windowMs: this.config.windowMs,
                max: this.config.maxRequests,
                duration: this.config.windowMs / 1000,
                points: this.config.maxRequests
            };
        }

        // ---------------------------
        // PRIMARY → FALLBACK
        // ---------------------------
        try {
            logger.info("📌 RateLimiter: primary adapter", final);
            return this.primaryAdapter.getMiddleware(final);

        } catch (err: any) {
            logger.warn("⚠ Primary rate limiter failed → fallback", {
                error: err?.message
            });

            if (!this.fallbackAdapter) {
                throw new AdapterError("Rate limiters failed; no fallback adapter.");
            }

            try {
                logger.info("📌 Using fallback rate limiter", final);
                return this.fallbackAdapter.getMiddleware(final);
            } catch (fallbackErr: any) {
                logger.error("❌ Fallback limiter also failed", {
                    error: fallbackErr?.message
                });
                throw new AdapterError("Both primary and fallback limiters failed.");
            }
        }
    }
}
