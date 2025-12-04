import sanitizeHtml from "sanitize-html";
import { AdapterError } from "../core/errors/AdapterError";
import { logger } from "../logging";

export class SanitizeHtmlAdapter {
    private options: sanitizeHtml.IOptions;

    constructor(options: sanitizeHtml.IOptions = {}) {
        this.options = options;
    }

    sanitize(input: string): string {
        try {
            const result = sanitizeHtml(input, this.options);

            // sanitize-html always returns string but enforce for TS
            return typeof result === "string" ? result : String(result);

        } catch (err: any) {
            logger.error("❌ sanitize-html failed", {
                error: err?.message || err,
                inputPreview: typeof input === "string" ? input.slice(0, 100) : undefined
            });

            throw new AdapterError("sanitize-html adapter failed.");
        }
    }

    // Recursively sanitize nested objects & arrays
    private deepSanitize(obj: any): any {
        if (typeof obj === "string") {
            return this.sanitize(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.deepSanitize(item));
        }

        if (obj && typeof obj === "object") {
            const cleaned: any = {};
            for (const key of Object.keys(obj)) {
                cleaned[key] = this.deepSanitize(obj[key]);
            }
            return cleaned;
        }

        return obj; // primitive (number, boolean, null, etc.)
    }

    middleware() {
        return (req: any, _res: any, next: any) => {
            try {
                if (req.body) {
                    req.body = this.deepSanitize(req.body);

                    logger.debug("🧼 Request sanitized successfully", {
                        keys: Object.keys(req.body)
                    });
                }
                next();
            } catch (err: any) {
                logger.error("❌ Sanitizer middleware error", {
                    error: err?.message || err
                });
                next(err);
            }
        };
    }
}
