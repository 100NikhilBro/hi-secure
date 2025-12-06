// import { SanitizerError } from "../core/errors/SanitizerError";
// import { logger } from "../logging";

// interface SanitizerAdapter {
//     sanitize: (value: string) => string;
//     middleware?: () => any;
// }

// export class SanitizerManager {
//     private primary: SanitizerAdapter;
//     private fallback: SanitizerAdapter | null;

//     constructor(primary: SanitizerAdapter, fallback: SanitizerAdapter | null = null) {
//         this.primary = primary;
//         this.fallback = fallback;
//     }

//     sanitize(value: string): string {
//         try {
//             return this.primary.sanitize(value);
//         } catch (err: any) {
//             logger.warn("⚠ Sanitizer primary adapter failed", { error: err?.message });

//             if (!this.fallback) {
//                 throw new SanitizerError("Primary sanitizer failed, no fallback available.");
//             }

//             try {
//                 logger.info("📌 Using fallback sanitizer");
//                 return this.fallback.sanitize(value);
//             } catch (fallbackErr: any) {
//                 logger.error("❌ Fallback sanitizer failed", {
//                     error: fallbackErr?.message
//                 });
//                 throw new SanitizerError("Both primary and fallback sanitizers failed.");
//             }
//         }
//     }

//     middleware() {
//         return (req: any, _res: any, next: any) => {
//             try {
//                 if (req.body && typeof req.body === "object") {
//                     for (const key of Object.keys(req.body)) {
//                         const value = req.body[key];

//                         if (typeof value === "string") {
//                             const clean = this.sanitize(value);

//                             logger.debug("🧼 Sanitized field", {
//                                 field: key,
//                                 before: value.slice(0, 80),
//                                 after: clean.slice(0, 80),
//                             });

//                             req.body[key] = clean;
//                         }
//                     }
//                 }

//                 next();
//             } catch (err: any) {
//                 logger.error("❌ Sanitizer middleware failed", { error: err?.message });
//                 next(new SanitizerError("Sanitizer middleware failure"));
//             }
//         };
//     }
// }



// src/managers/SanitizerManager.ts
import { SanitizerError } from "../core/errors/SanitizerError";
import { logger } from "../logging";

interface SanitizerAdapter {
    sanitize: (value: string, options?: any) => string;
}

export class SanitizerManager {
    private primary: SanitizerAdapter;
    private fallback: SanitizerAdapter | null;

    constructor(primary: SanitizerAdapter, fallback: SanitizerAdapter | null = null) {
        this.primary = primary;
        this.fallback = fallback;
    }

    /**
     * Sanitize a single value with optional dynamic options.
     */
    sanitize(value: string, options?: any): string {
        try {
            return this.primary.sanitize(value, options);

        } catch (err: any) {
            logger.warn("⚠ Primary sanitizer failed", { error: err?.message });

            if (!this.fallback) {
                throw new SanitizerError("Primary sanitizer failed and no fallback available.");
            }

            try {
                logger.info("📌 Using fallback sanitizer");
                return this.fallback.sanitize(value, options);

            } catch (fallbackErr: any) {
                logger.error("❌ Fallback sanitizer failed", {
                    error: fallbackErr?.message
                });

                throw new SanitizerError("Both primary and fallback sanitizers failed.");
            }
        }
    }

    /**
     * Dynamic express middleware for sanitizing body.
     * Options can override global config on each route.
     */
    middleware(options?: any) {
        return (req: any, _res: any, next: any) => {
            try {
                if (req.body && typeof req.body === "object") {
                    for (const key of Object.keys(req.body)) {
                        const original = req.body[key];

                        if (typeof original === "string") {
                            const sanitized = this.sanitize(original, options);

                            logger.debug("🧼 Sanitized field", {
                                field: key,
                                before: original.slice(0, 80),
                                after: sanitized.slice(0, 80)
                            });

                            req.body[key] = sanitized;
                        }
                    }
                }

                next();

            } catch (err: any) {
                logger.error("❌ Sanitizer middleware failed", {
                    error: err?.message
                });

                next(new SanitizerError("Sanitizer middleware failure"));
            }
        };
    }
}
