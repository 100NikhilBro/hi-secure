// src/managers/ValidatorManager.ts - COMPLETE FIXED
import { logger } from "../logging";
import { ValidationError } from "../core/errors/ValidationError.js";
import { HiSecureConfig } from "../core/types/HiSecureConfig.js"; // ✅ FIXED IMPORT

interface ValidatorAdapter {
    validate: (schema?: any) => any;
}

export class ValidatorManager {
    private config: HiSecureConfig["validation"];
    private primaryAdapter: ValidatorAdapter;
    private fallbackAdapter: ValidatorAdapter | null;

    constructor(
        config: HiSecureConfig["validation"],
        primaryAdapter: ValidatorAdapter,
        fallbackAdapter: ValidatorAdapter | null
    ) {
        this.config = config;
        this.primaryAdapter = primaryAdapter;
        this.fallbackAdapter = fallbackAdapter;
    }

    validate(schema?: any) {
        return (req: any, res: any, next: any) => {
            // Execute primary adapter middleware
            const primaryMiddleware = this.primaryAdapter.validate(schema);
            
            // Run middleware and handle errors properly
            primaryMiddleware(req, res, (err?: any) => {
                if (!err) {
                    return next(); // Validation passed
                }
                
                // If error is a ValidationError, pass it through (don't fallback!)
                if (err instanceof ValidationError) {
                    logger.warn("⚠ Validation failed", {
                        path: req.path,
                        method: req.method,
                        error: err.message
                    });
                    return next(err);
                }
                
                // Only use fallback for ADAPTER errors, not validation errors
                logger.warn("⚠ Primary validator adapter failed", {
                    error: err?.message,
                    path: req.path,
                    method: req.method
                });

                if (!this.fallbackAdapter) {
                    return next(new ValidationError("Validation system error"));
                }

                // Try fallback adapter
                const fallbackMiddleware = this.fallbackAdapter.validate(schema);
                fallbackMiddleware(req, res, (fallbackErr?: any) => {
                    if (fallbackErr) {
                        logger.error("❌ Fallback validator also failed", {
                            error: fallbackErr?.message
                        });
                        return next(new ValidationError("Validation system unavailable"));
                    }
                    next(); // Fallback validation passed
                });
            });
        };
    }
}




// // src/managers/ValidatorManager.ts
// import { logger } from "../logging";
// import { ValidationError } from "../core/errors/ValidationError.js";

// interface ValidatorAdapter {
//     validate: (schema?: any) => any;
// }

// export class ValidatorManager {
//     private primaryAdapter: ValidatorAdapter;
//     private fallbackAdapter: ValidatorAdapter | null;

//     constructor(primaryAdapter: ValidatorAdapter, fallbackAdapter: ValidatorAdapter | null) {
//         this.primaryAdapter = primaryAdapter;
//         this.fallbackAdapter = fallbackAdapter;
//     }

//     validate(schema?: any) {
//         return (req: any, res: any, next: any) => {
//             const isZod = schema && typeof schema === "object" && typeof schema.safeParse === "function";
//             const isExpressValidator = Array.isArray(schema);

//             let adapter: ValidatorAdapter;

//             if (isZod) {
//                 adapter = this.primaryAdapter; // ZodAdapter
//                 logger.debug("📌 Using Zod adapter for validation");
//             } 
//             else if (isExpressValidator) {
//                 adapter = this.fallbackAdapter!; // ExpressValidatorAdapter
//                 logger.debug("📌 Using express-validator adapter for validation");
//             } 
//             else {
//                 return next(); // nothing to validate
//             }

//             const middleware = adapter.validate(schema);

//             // Execute validation chain
//             middleware(req, res, (err?: any) => {
//                 if (err instanceof ValidationError) {
//                     return next(err);
//                 }
//                 if (err) {
//                     logger.error("❌ Validator internal error", { error: err.message });
//                     return next(new ValidationError("Validation failed internally."));
//                 }
//                 next();
//             });
//         };
//     }
// }





// // // src/managers/ValidatorManager.ts
// // import { logger } from "../logging";
// // import { ValidationError } from "../core/errors/ValidationError.js";

// // interface ValidatorAdapter {
// //     validate: (schema?: any) => any;
// // }

// // export class ValidatorManager {
// //     private zodAdapter: ValidatorAdapter;
// //     private expressAdapter: ValidatorAdapter;

// //     constructor(zodAdapter: ValidatorAdapter, expressAdapter: ValidatorAdapter) {
// //         this.zodAdapter = zodAdapter;
// //         this.expressAdapter = expressAdapter;
// //     }

// //     validate(schema?: any) {
// //         // const isZod = schema && typeof schema.safeParse === "function";
// //         const isZod =
// //     schema &&
// //     typeof schema === "object" &&
// //     typeof schema._def === "object" && 
// //     typeof schema.safeParse === "function";

// //         const isExpressValidator = Array.isArray(schema);

// //         return (req: any, res: any, next: any) => {
// //             let middleware;

// //             if (isZod) {
// //                 logger.debug("📌 Using Zod adapter");
// //                 middleware = this.zodAdapter.validate(schema);
// //             } 
// //             else if (isExpressValidator) {
// //                 logger.debug("📌 Using express-validator adapter");
// //                 middleware = this.expressAdapter.validate(schema);
// //             } 
// //             else {
// //                 return next(); // no schema found
// //             }

// //             // CASE 1 — express-validator returns ARRAY
// //             if (Array.isArray(middleware)) {
// //                 let idx = 0;

// //                 const run = (err?: any) => {
// //                     if (err) return next(err);

// //                     const fn = middleware[idx++];
// //                     if (!fn) return next(); // done

// //                     try {
// //                         fn(req, res, run);
// //                     } catch (error: any) {
// //                         next(new ValidationError(error.message));
// //                     }
// //                 };

// //                 return run();
// //             }

// //             // CASE 2 — Zod returns SINGLE MIDDLEWARE
// //             try {
// //                 middleware(req, res, (err?: any) => {
// //                     if (err) return next(err);
// //                     next();
// //                 });
// //             } catch (err: any) {
// //                 next(new ValidationError(err.message));
// //             }
// //         };
// //     }
// // }

