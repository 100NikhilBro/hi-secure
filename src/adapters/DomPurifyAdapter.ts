import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { AdapterError } from "../core/errors/AdapterError";
import { logger } from "../logging";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

export class DomPurifyAdapter {
    private options: any;

    constructor(options: any = {}) {
        this.options = options;
    }

    sanitize(input: string): string {
        try {
            if (typeof input !== "string") {
                logger.warn("⚠ DomPurify: Non-string value skipped", {
                    received: typeof input
                });
                return input as any;
            }

            // FIX: convert TrustedHTML → string
            const clean = DOMPurify.sanitize(input, this.options);

            return clean.toString(); // ⬅⬅ THE FIX
        } catch (err: any) {
            logger.error("❌ DOMPurify sanitizer failed", {
                error: err?.message || err,
                inputPreview: input?.slice?.(0, 100)
            });

            throw new AdapterError("DOMPurify sanitizer failed.");
        }
    }

    middleware() {
        return (req: any, res: any, next: any) => {
            try {
                const body = req.body;

                if (body && typeof body === "object") {
                    for (const key of Object.keys(body)) {
                        const value = body[key];

                        if (typeof value === "string") {
                            body[key] = this.sanitize(value);
                        }

                        if (Array.isArray(value)) {
                            body[key] = value.map(v =>
                                typeof v === "string" ? this.sanitize(v) : v
                            );
                        }
                    }
                }

                next();
            } catch (err: any) {
                logger.error("❌ DOMPurify middleware failed", {
                    error: err?.message || err
                });
                next(err);
            }
        };
    }
}
