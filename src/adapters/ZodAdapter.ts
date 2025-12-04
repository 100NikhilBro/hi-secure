import { ZodSchema } from "zod";
import { ValidationError } from "../core/errors/ValidationError";

export class ZodAdapter {
    validate(schema: ZodSchema) {
        return (req: any, res: any, next: any) => {
            try {
                schema.parse(req.body);
                next();
            } catch (err: any) {
                throw new ValidationError(err.errors?.[0]?.message || "Validation failed.");
            }
        };
    }
}
