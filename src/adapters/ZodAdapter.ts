// import { ZodSchema, ZodError } from "zod";
// import { ValidationError } from "../core/errors/ValidationError";
// import { logger } from "../logging";

// export class ZodAdapter {
//     private globalSchema?: ZodSchema;

//     constructor(globalSchema?: ZodSchema) {
//         this.globalSchema = globalSchema as any;
//     }

//     /**
//      * Validate with global + dynamic schema (dynamic overrides global)
//      */
//     validate(dynamicSchema?: ZodSchema) {
//         return (req: any, res: any, next: any) => {
//             const schema = dynamicSchema || this.globalSchema;

//             if (!schema) return next(); // no validation for this route

//             const result = schema.safeParse(req.body);

//             if (result.success) return next();

//             const zodErr: ZodError = result.error;

//             const issues = zodErr.issues.map(issue => ({
//                 message: issue.message,
//                 path: issue.path.join("."),
//                 code: issue.code
//             }));

//             logger.warn("⚠ Zod validation failed", {
//                 path: req.path,
//                 method: req.method,
//                 issues,
//                 preview: JSON.stringify(req.body).slice(0, 200)
//             });

//             return next(
//                 new ValidationError(issues[0]?.message || "Validation failed.")
//             );
//         };
//     }
// }



// src/adapters/ZodAdapter.ts - FIXED
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../core/errors/ValidationError.js"; // ✅ Add .js
import { logger } from "../logging/index.js";

export class ZodAdapter {
    private globalSchema?: ZodSchema;

    constructor(globalSchema?: ZodSchema) {
        this.globalSchema = globalSchema;
    }

    validate(dynamicSchema?: ZodSchema) {
        return (req: any, res: any, next: any) => {
            const schema = dynamicSchema || this.globalSchema;

            if (!schema) return next();

            const result = schema.safeParse(req.body);

            if (result.success) return next();

            const zodErr: ZodError = result.error;

            const issues = zodErr.issues.map(issue => ({
                message: issue.message,
                path: issue.path.join("."),
                code: issue.code
            }));

            logger.warn("⚠ Zod validation failed", {
                path: req.path,
                method: req.method,
                issues,
                preview: JSON.stringify(req.body).slice(0, 200)
            });

            return next(
                new ValidationError("Validation failed.", issues as any) // ✅ Pass issues
            );
        };
    }
}