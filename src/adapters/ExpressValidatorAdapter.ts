// import { validationResult } from "express-validator";
// import { ValidationError } from "../core/errors/ValidationError";
// import { logger } from "../logging";

// export class ExpressValidatorAdapter {
//     private globalSchema?: any[];

//     constructor(globalSchema?: any[]) {
//         this.globalSchema = globalSchema as any;;
//     }

//     /**
//      * Dynamic schema override
//      */
//     validate(dynamicSchema?: any[]) {
//         const schema = dynamicSchema || this.globalSchema;

//         if (!schema || !Array.isArray(schema)) {
//             return (req: any, res: any, next: any) => next();
//         }

//         return [
//             ...schema,

//             (req: any, res: any, next: any) => {
//                 const errors = validationResult(req);

//                 if (!errors.isEmpty()) {
//                     const formatted = errors.array().map(err => ({
//                         message: err.msg,
//                     }));

//                     logger.warn("⚠ express-validator failed", {
//                         path: req.path,
//                         method: req.method,
//                         errors: formatted,
//                         preview: JSON.stringify(req.body).slice(0, 200)
//                     });

//                     return next(new ValidationError("Validation failed."));
//                 }

//                 next();
//             }
//         ];
//     }
// }





// src/adapters/ExpressValidatorAdapter.ts - FIXED
import { validationResult } from "express-validator";
import { ValidationError } from "../core/errors/ValidationError.js"; // ✅ Add .js
import { logger } from "../logging/index.js";

export class ExpressValidatorAdapter {
    private globalSchema?: any[];

    constructor(globalSchema?: any[]) {
        this.globalSchema = globalSchema;
    }

    validate(dynamicSchema?: any[]) {
        const schema = dynamicSchema || this.globalSchema;

        if (!schema || !Array.isArray(schema)) {
            return (req: any, res: any, next: any) => next();
        }

        return [
            ...schema,

            (req: any, res: any, next: any) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    const formatted = errors.array().map(err => ({
                        message: err.msg,
                        // param: err.param ,
                        // location: err.location
                    }));

                    logger.warn("⚠ express-validator failed", {
                        path: req.path,
                        method: req.method,
                        errors: formatted,
                        preview: JSON.stringify(req.body).slice(0, 200)
                    });

                    return next(new ValidationError("Validation failed.", formatted as any));
                }

                next();
            }
        ];
    }
}