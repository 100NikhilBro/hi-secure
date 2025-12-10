// // // import { HiSecureConfig } from "../core/config";
// // // import { logger } from "../logging";
// // // import { ValidationError } from "../core/errors/ValidationError";

// // // export class ValidatorManager {
// // //     private config: HiSecureConfig["validation"];
// // //     private primaryAdapter: any;
// // //     private fallbackAdapter: any;

// // //     constructor(
// // //         config: HiSecureConfig["validation"],
// // //         primaryAdapter: any,
// // //         fallbackAdapter: any
// // //     ) {
// // //         this.config = config;
// // //         this.primaryAdapter = primaryAdapter;
// // //         this.fallbackAdapter = fallbackAdapter;
// // //     }

// // //     /**
// // //      * Validate request body using primary adapter (Zod/express-validator).
// // //      * Fallback is only used if the adapter implementation itself throws.
// // //      */
// // //     validate(schema: any) {
// // //         return (req: any, res: any, next: any) => {
// // //             try {
// // //                 const middleware = this.primaryAdapter.validate(schema);
// // //                 return middleware(req, res, next);

// // //             } catch (err: any) {
// // //                 logger.warn("⚠ Primary validator failed", {
// // //                     error: err?.message,
// // //                     path: req.path,
// // //                     method: req.method
// // //                 });

// // //                 if (!this.fallbackAdapter) {
// // //                     return next(new ValidationError("Validation failed."));
// // //                 }

// // //                 try {
// // //                     logger.info("📌 Using fallback validator");
// // //                     const fallbackMiddleware = this.fallbackAdapter.validate(schema);
// // //                     return fallbackMiddleware(req, res, next);

// // //                 } catch (fallbackErr: any) {
// // //                     logger.error("❌ Fallback validation also failed", {
// // //                         error: fallbackErr?.message
// // //                     });

// // //                     return next(new ValidationError("Both validators failed."));
// // //                 }
// // //             }
// // //         };
// // //     }
// // // }



// // import { HiSecureConfig } from "../core/config.js";
// // import { logger } from "../logging";
// // import { ValidationError } from "../core/errors/ValidationError.js";

// // interface ValidatorAdapter {
// //     validate: (schema?: any) => any;
// // }

// // export class ValidatorManager {
// //     private config: HiSecureConfig["validation"];
// //     private primaryAdapter: ValidatorAdapter;
// //     private fallbackAdapter: ValidatorAdapter | null;

// //     constructor(
// //         config: HiSecureConfig["validation"],
// //         primaryAdapter: ValidatorAdapter,
// //         fallbackAdapter: ValidatorAdapter | null
// //     ) {
// //         this.config = config;
// //         this.primaryAdapter = primaryAdapter;
// //         this.fallbackAdapter = fallbackAdapter;
// //     }

// //     /**
// //      * MAIN DYNAMIC VALIDATOR ENTRY
// //      * schema = per-route schema
// //      * If schema is undefined → use global schema
// //      */
// //     validate(schema?: any) {
// //         return (req: any, res: any, next: any) => {
// //             try {
// //                 const middleware = this.primaryAdapter.validate(schema);
// //                 return middleware(req, res, next);

// //             } catch (err: any) {
// //                 logger.warn("⚠ Primary validator failed", {
// //                     error: err?.message,
// //                     path: req.path,
// //                     method: req.method
// //                 });

// //                 if (!this.fallbackAdapter) {
// //                     return next(new ValidationError("Validation failed"));
// //                 }

// //                 try {
// //                     logger.info("📌 Using fallback validator");
// //                     const fallbackMiddleware = this.fallbackAdapter.validate(schema);
// //                     return fallbackMiddleware(req, res, next);

// //                 } catch (fallbackErr: any) {
// //                     logger.error("❌ Fallback validator also failed", {
// //                         error: fallbackErr?.message
// //                     });

// //                     return next(new ValidationError("Both validators failed"));
// //                 }
// //             }
// //         };
// //     }
// // }





// // src/managers/ValidatorManager.ts - FIXED
// import { logger } from "../logging";
// import { ValidationError } from "../core/errors/ValidationError.js";
// import { HiSecureConfig } from "../core/types/HiSecureConfig";

// interface ValidatorAdapter {
//     validate: (schema?: any) => any;
// }

// export class ValidatorManager {
//     private config: HiSecureConfig["validation"];
//     private primaryAdapter: ValidatorAdapter;
//     private fallbackAdapter: ValidatorAdapter | null;

//     constructor(
//         config: HiSecureConfig["validation"],
//         primaryAdapter: ValidatorAdapter,
//         fallbackAdapter: ValidatorAdapter | null
//     ) {
//         this.config = config;
//         this.primaryAdapter = primaryAdapter;
//         this.fallbackAdapter = fallbackAdapter;
//     }

//     validate(schema?: any) {
//         return (req: any, res: any, next: any) => {
//             // Execute primary adapter middleware
//             const primaryMiddleware = this.primaryAdapter.validate(schema);
            
//             // Run middleware and handle errors properly
//             primaryMiddleware(req, res, (err?: any) => {
//                 if (!err) {
//                     return next(); // Validation passed
//                 }
                
//                 // If error is a ValidationError, pass it through (don't fallback!)
//                 if (err instanceof ValidationError) {
//                     logger.warn("⚠ Validation failed", {
//                         path: req.path,
//                         method: req.method,
//                         error: err.message
//                     });
//                     return next(err);
//                 }
                
//                 // Only use fallback for ADAPTER errors, not validation errors
//                 logger.warn("⚠ Primary validator adapter failed", {
//                     error: err?.message,
//                     path: req.path,
//                     method: req.method
//                 });

//                 if (!this.fallbackAdapter) {
//                     return next(new ValidationError("Validation system error"));
//                 }

//                 // Try fallback adapter
//                 const fallbackMiddleware = this.fallbackAdapter.validate(schema);
//                 fallbackMiddleware(req, res, (fallbackErr?: any) => {
//                     if (fallbackErr) {
//                         logger.error("❌ Fallback validator also failed", {
//                             error: fallbackErr?.message
//                         });
//                         return next(new ValidationError("Validation system unavailable"));
//                     }
//                     next(); // Fallback validation passed
//                 });
//             });
//         };
//     }
// }


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