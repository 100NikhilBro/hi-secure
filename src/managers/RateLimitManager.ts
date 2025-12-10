// // // src/managers/RateLimitManager.ts
// // import { HiSecureConfig } from "../core/config.js";
// // import { AdapterError } from "../core/errors/AdapterError.js";
// // import { logger } from "../logging";

// // interface RateLimiterAdapter {
// //     getMiddleware: (options?: any) => any;
// // }

// // export class RateLimitManager {
// //     private config: HiSecureConfig["rateLimiter"];
// //     private primaryAdapter: RateLimiterAdapter;
// //     private fallbackAdapter: RateLimiterAdapter | null;

// //     constructor(
// //         config: HiSecureConfig["rateLimiter"],
// //         primaryAdapter: RateLimiterAdapter,
// //         fallbackAdapter: RateLimiterAdapter | null
// //     ) {
// //         this.config = config;
// //         this.primaryAdapter = primaryAdapter;
// //         this.fallbackAdapter = fallbackAdapter;
// //     }

// //     middleware(opts?: { mode?: "strict" | "relaxed" | undefined; options?: any }) {
// //         let final: any = {};

// //         // ---------------------------
// //         // MODE PRESETS
// //         // ---------------------------
// //         if (opts?.mode === "strict") {
// //             final = {
// //                 windowMs: 10_000,
// //                 max: 5,
// //                 points: 5,
// //                 duration: 10
// //             };
// //         }

// //         if (opts?.mode === "relaxed") {
// //             final = {
// //                 windowMs: 60_000,
// //                 max: 100,
// //                 points: 100,
// //                 duration: 60
// //             };
// //         }

// //         // ---------------------------
// //         // CUSTOM OPTIONS
// //         // ---------------------------
// //         if (opts?.options) {
// //             final = { ...final, ...opts.options };
// //         }

// //         // ---------------------------
// //         // DEFAULT OPTIONS (opts undefined)
// //         // ---------------------------
// //         if (!opts) {
// //             final = {
// //                 windowMs: this.config.windowMs,
// //                 max: this.config.maxRequests,
// //                 duration: this.config.windowMs / 1000,
// //                 points: this.config.maxRequests
// //             };
// //         }

// //         // ---------------------------
// //         // PRIMARY → FALLBACK
// //         // ---------------------------
// //         try {
// //             logger.info("📌 RateLimiter: primary adapter", final);
// //             return this.primaryAdapter.getMiddleware(final);

// //         } catch (err: any) {
// //             logger.warn("⚠ Primary rate limiter failed → fallback", {
// //                 error: err?.message
// //             });

// //             if (!this.fallbackAdapter) {
// //                 throw new AdapterError("Rate limiters failed; no fallback adapter.");
// //             }

// //             try {
// //                 logger.info("📌 Using fallback rate limiter", final);
// //                 return this.fallbackAdapter.getMiddleware(final);
// //             } catch (fallbackErr: any) {
// //                 logger.error("❌ Fallback limiter also failed", {
// //                     error: fallbackErr?.message
// //                 });
// //                 throw new AdapterError("Both primary and fallback limiters failed.");
// //             }
// //         }
// //     }
// // }



// // src/managers/RateLimitManager.ts - FIXED
// import { HiSecureConfig } from "../core/types/HiSecureConfig.js";
// import { AdapterError } from "../core/errors/AdapterError.js";
// import { logger } from "../logging";

// interface RateLimiterAdapter {
//     getMiddleware: (options?: any) => any;
// }

// export class RateLimitManager {
//     private config: HiSecureConfig["rateLimiter"];
//     private primaryAdapter: RateLimiterAdapter;
//     private fallbackAdapter: RateLimiterAdapter | null;

//     constructor(
//         config: HiSecureConfig["rateLimiter"],
//         primaryAdapter: RateLimiterAdapter,
//         fallbackAdapter: RateLimiterAdapter | null
//     ) {
//         this.config = config;
//         this.primaryAdapter = primaryAdapter;
//         this.fallbackAdapter = fallbackAdapter;
//     }

//     middleware(opts?: { mode?: "strict" | "relaxed" | "api"; options?: any }) {
//         let finalOptions: any = {};

//         // Handle presets (user cannot override these)
//         if (opts?.mode === "strict") {
//             finalOptions = {
//                 windowMs: 10_000,
//                 max: 5,
//                 points: 5,
//                 duration: 10,
//                 message: "Too many requests, please slow down."
//             };
//         } else if (opts?.mode === "relaxed") {
//             finalOptions = {
//                 windowMs: 60_000,
//                 max: 100,
//                 points: 100,
//                 duration: 60,
//                 message: "Rate limit exceeded."
//             };
//         } else if (opts?.mode === "api") {
//             finalOptions = {
//                 windowMs: 15 * 60 * 1000, // 15 minutes
//                 max: 100,
//                 points: 100,
//                 duration: 900,
//                 message: "API rate limit exceeded."
//             };
//         } else {
//             // Use defaults
//             finalOptions = {
//                 windowMs: this.config.windowMs,
//                 max: this.config.maxRequests,
//                 duration: this.config.windowMs / 1000,
//                 points: this.config.maxRequests,
//                 message: this.config.message
//             };
//         }

//         // Apply custom options WITHOUT overriding preset values
//         if (opts?.options) {
//             // Only allow specific overrides, not preset overrides
//             const allowedOverrides = ['message', 'skipFailedRequests', 'standardHeaders'];
//             for (const key of allowedOverrides) {
//                 if (opts.options[key] !== undefined) {
//                     finalOptions[key] = opts.options[key];
//                 }
//             }
            
//             // Log if user tried to override preset
//             const attemptedOverrides = Object.keys(opts.options).filter(
//                 k => !allowedOverrides.includes(k) && k !== 'mode'
//             );
//             if (attemptedOverrides.length > 0) {
//                 logger.warn("⚠ Rate limit preset overrides ignored", {
//                     preset: opts.mode,
//                     ignoredOptions: attemptedOverrides
//                 });
//             }
//         }

//         // Try primary adapter
//         try {
//             logger.info("📌 Applying rate limiting", {
//                 mode: opts?.mode || 'default',
//                 windowMs: finalOptions.windowMs,
//                 max: finalOptions.max
//             });
            
//             return this.primaryAdapter.getMiddleware(finalOptions);
//         } catch (err: any) {
//             logger.warn("⚠ Primary rate limiter failed → fallback", {
//                 error: err?.message
//             });

//             if (!this.fallbackAdapter) {
//                 throw new AdapterError("Rate limiters failed; no fallback adapter.");
//             }

//             try {
//                 logger.info("📌 Using fallback rate limiter");
//                 return this.fallbackAdapter.getMiddleware(finalOptions);
//             } catch (fallbackErr: any) {
//                 logger.error("❌ Fallback limiter also failed", {
//                     error: fallbackErr?.message
//                 });
//                 throw new AdapterError("Both primary and fallback limiters failed.");
//             }
//         }
//     }
// }



// src/managers/RateLimitManager.ts - COMPLETE FIXED
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

        // Handle presets (user cannot override these)
        if (opts?.mode === "strict") {
            finalOptions = {
                windowMs: 10_000,
                max: 5,
                points: 5,
                duration: 10,
                message: "Too many requests, please slow down."
            };
        } else if (opts?.mode === "relaxed") {
            finalOptions = {
                windowMs: 60_000,
                max: 100,
                points: 100,
                duration: 60,
                message: "Rate limit exceeded."
            };
        } else if (opts?.mode === "api") {
            finalOptions = {
                windowMs: 15 * 60 * 1000, // 15 minutes
                max: 100,
                points: 100,
                duration: 900,
                message: "API rate limit exceeded."
            };
        } else {
            // Use defaults
            finalOptions = {
                windowMs: this.config.windowMs,
                max: this.config.maxRequests,
                duration: this.config.windowMs / 1000,
                points: this.config.maxRequests,
                message: this.config.message
            };
        }

        // Apply custom options WITHOUT overriding preset values
        if (opts?.options) {
            // Only allow specific overrides, not preset overrides
            const allowedOverrides = ['message', 'skipFailedRequests', 'standardHeaders'];
            for (const key of allowedOverrides) {
                if (opts.options[key] !== undefined) {
                    finalOptions[key] = opts.options[key];
                }
            }
            
            // Log if user tried to override preset
            const attemptedOverrides = Object.keys(opts.options).filter(
                k => !allowedOverrides.includes(k) && k !== 'mode'
            );
            if (attemptedOverrides.length > 0) {
                logger.warn("⚠ Rate limit overrides ignored", { // ✅ FIXED: Better message
                    preset: opts?.mode || 'default', // ✅ FIXED: Handle undefined
                    ignoredOptions: attemptedOverrides
                });
            }
        }

        // Try primary adapter
        try {
            logger.info("📌 Applying rate limiting", {
                mode: opts?.mode || 'default',
                windowMs: finalOptions.windowMs,
                max: finalOptions.max
            });
            
            return this.primaryAdapter.getMiddleware(finalOptions);
        } catch (err: any) {
            logger.warn("⚠ Primary rate limiter failed → fallback", {
                error: err?.message
            });

            if (!this.fallbackAdapter) {
                throw new AdapterError("Rate limiters failed; no fallback adapter.");
            }

            try {
                logger.info("📌 Using fallback rate limiter");
                return this.fallbackAdapter.getMiddleware(finalOptions);
            } catch (fallbackErr: any) {
                logger.error("❌ Fallback limiter also failed", {
                    error: fallbackErr?.message
                });
                throw new AdapterError("Both primary and fallback limiters failed.");
            }
        }
    }
}