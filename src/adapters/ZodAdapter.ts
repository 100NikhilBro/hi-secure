import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../core/errors/ValidationError.js"; 
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

            logger.warn("Zod validation failed", {
                path: req.path,
                method: req.method,
                issues,
                preview: JSON.stringify(req.body).slice(0, 200)
            });

            return next(
                new ValidationError("Validation failed.", issues as any) 
            );
        };
    }
}