import { validationResult } from "express-validator";
import { ValidationError } from "../core/errors/ValidationError";
import { logger } from "../logging";

export class ExpressValidatorAdapter {
    validate(schema: any[]) {
        return [
            ...schema,

            (req: any, res: any, next: any) => {
                const errors = validationResult(req);

                if (!errors.isEmpty()) {
                    const errorList = errors.array().map(err => ({
                        message: err.msg,
                        // field: err.param,
                        // location: err.location
                    }));

                    logger.warn("⚠ express-validator validation failed", {
                        path: req.path,
                        method: req.method,
                        errors: errorList,
                        bodyPreview: JSON.stringify(req.body).slice(0, 200)
                    });

                    // ⭐ Correct middleware behavior — pass error to central handler
                    return next(new ValidationError("Validation failed."));
                }

                next();
            }
        ];
    }
}
