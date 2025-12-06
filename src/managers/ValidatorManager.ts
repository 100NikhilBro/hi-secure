// import { HiSecureConfig } from "../core/config";
// import { logger } from "../logging";
// import { ValidationError } from "../core/errors/ValidationError";

// export class ValidatorManager {
//     private config: HiSecureConfig["validation"];
//     private primaryAdapter: any;
//     private fallbackAdapter: any;

//     constructor(
//         config: HiSecureConfig["validation"],
//         primaryAdapter: any,
//         fallbackAdapter: any
//     ) {
//         this.config = config;
//         this.primaryAdapter = primaryAdapter;
//         this.fallbackAdapter = fallbackAdapter;
//     }

//     /**
//      * Validate request body using primary adapter (Zod/express-validator).
//      * Fallback is only used if the adapter implementation itself throws.
//      */
//     validate(schema: any) {
//         return (req: any, res: any, next: any) => {
//             try {
//                 const middleware = this.primaryAdapter.validate(schema);
//                 return middleware(req, res, next);

//             } catch (err: any) {
//                 logger.warn("⚠ Primary validator failed", {
//                     error: err?.message,
//                     path: req.path,
//                     method: req.method
//                 });

//                 if (!this.fallbackAdapter) {
//                     return next(new ValidationError("Validation failed."));
//                 }

//                 try {
//                     logger.info("📌 Using fallback validator");
//                     const fallbackMiddleware = this.fallbackAdapter.validate(schema);
//                     return fallbackMiddleware(req, res, next);

//                 } catch (fallbackErr: any) {
//                     logger.error("❌ Fallback validation also failed", {
//                         error: fallbackErr?.message
//                     });

//                     return next(new ValidationError("Both validators failed."));
//                 }
//             }
//         };
//     }
// }



import { HiSecureConfig } from "../core/config";
import { logger } from "../logging";
import { ValidationError } from "../core/errors/ValidationError";

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

    /**
     * MAIN DYNAMIC VALIDATOR ENTRY
     * schema = per-route schema
     * If schema is undefined → use global schema
     */
    validate(schema?: any) {
        return (req: any, res: any, next: any) => {
            try {
                const middleware = this.primaryAdapter.validate(schema);
                return middleware(req, res, next);

            } catch (err: any) {
                logger.warn("⚠ Primary validator failed", {
                    error: err?.message,
                    path: req.path,
                    method: req.method
                });

                if (!this.fallbackAdapter) {
                    return next(new ValidationError("Validation failed"));
                }

                try {
                    logger.info("📌 Using fallback validator");
                    const fallbackMiddleware = this.fallbackAdapter.validate(schema);
                    return fallbackMiddleware(req, res, next);

                } catch (fallbackErr: any) {
                    logger.error("❌ Fallback validator also failed", {
                        error: fallbackErr?.message
                    });

                    return next(new ValidationError("Both validators failed"));
                }
            }
        };
    }
}
