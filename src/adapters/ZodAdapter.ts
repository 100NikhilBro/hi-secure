import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../core/errors/ValidationError";
import { logger } from "../logging";

export class ZodAdapter {
    validate(schema: ZodSchema) {
        return (req: any, res: any, next: any) => {
            const result = schema.safeParse(req.body);

            if (result.success) {
                return next();
            }

            // result.error is guaranteed to be ZodError
            const zodError: ZodError = result.error;

            const issues = zodError.issues.map(issue => ({
                message: issue.message,
                path: issue.path.join("."),
                code: issue.code,
            }));

            logger.warn("⚠ Zod validation failed", {
                path: req.path,
                method: req.method,
                issues,
                bodyPreview: JSON.stringify(req.body).slice(0, 200)
            });

            // Throw clean error to middleware
            return next(
                new ValidationError(issues[0]?.message || "Validation failed")
            );
        };
    }
}
