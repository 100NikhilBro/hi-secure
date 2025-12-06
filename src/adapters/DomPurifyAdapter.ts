import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { AdapterError } from "../core/errors/AdapterError";
import { logger } from "../logging";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

export class DomPurifyAdapter {
    private globalOptions: any;

    constructor(options: any = {}) {
        this.globalOptions = options;
    }

    /**
     * Sanitize a string with global + dynamic merged options
     */
    sanitize(input: string, dynamicOptions?: any): string {
        try {
            if (typeof input !== "string") return input as any;

            const merged = { ...this.globalOptions, ...(dynamicOptions || {}) };

            const clean = DOMPurify.sanitize(input, merged);

            return clean.toString();

        } catch (err: any) {
            logger.error("❌ DomPurify sanitize failed", {
                error: err?.message,
                preview: input?.slice?.(0, 80)
            });
            throw new AdapterError("DomPurify sanitizer failed.");
        }
    }

    /**
     * Middleware wrapper WITH dynamic options
     */
    middleware(dynamicOptions?: any) {
        return (req: any, _res: any, next: any) => {
            try {
                const body = req.body;

                if (body && typeof body === "object") {
                    for (const key of Object.keys(body)) {
                        const val = body[key];

                        if (typeof val === "string") {
                            body[key] = this.sanitize(val, dynamicOptions);
                        }

                        if (Array.isArray(val)) {
                            body[key] = val.map((v) =>
                                typeof v === "string"
                                    ? this.sanitize(v, dynamicOptions)
                                    : v
                            );
                        }
                    }
                }

                next();
            } catch (err: any) {
                logger.error("❌ DomPurify middleware failed", {
                    error: err?.message || err
                });
                next(err);
            }
        };
    }
}
