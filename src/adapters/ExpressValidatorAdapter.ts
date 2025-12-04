import { validationResult } from "express-validator";
import { ValidationError } from "../core/errors/ValidationError";

export class ExpressValidatorAdapter {
    validate(schema: any[]) {
        return [
            ...schema,
            (req: any, res: any, next: any) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    throw new ValidationError("Validation failed.");
                }
                next();
            }
        ];
    }
}
