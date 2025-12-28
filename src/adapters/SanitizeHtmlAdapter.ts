// import sanitizeHtml from "sanitize-html";
// import { AdapterError } from "../core/errors/AdapterError.js";
// import { logger } from "../logging/index.js";

// export class SanitizeHtmlAdapter {
//     private globalOptions: sanitizeHtml.IOptions;

//     constructor(options: sanitizeHtml.IOptions = {}) {
//         this.globalOptions = options;
//     }

//     sanitize(input: string, dynamicOptions?: any): string {
//         try {
//             const opts = { ...this.globalOptions, ...(dynamicOptions || {}) };

//             const clean = sanitizeHtml(input, opts);
//             return typeof clean === "string" ? clean : String(clean);

//         } catch (err: any) {
//             logger.error("sanitize-html failed", {
//                 error: err?.message || err,
//                 preview: typeof input === "string" ? input.slice(0, 100) : undefined
//             });

//             throw new AdapterError("sanitize-html adapter failed.");
//         }
//     }

//     // Deep Sanitization - Recursively 
//     private deepSanitize(obj: any, dynamicOptions?: any, visited = new WeakSet()): any {
        
//         if (obj && typeof obj === "object") {
//             if (visited.has(obj)) {
//                 return obj; 
//             }
//             visited.add(obj);
//         }

//         if (typeof obj === "string") {
//             return this.sanitize(obj, dynamicOptions);
//         }

//         if (Array.isArray(obj)) {
//             return obj.map((item) => this.deepSanitize(item, dynamicOptions, visited));
//         }

//         if (obj && typeof obj === "object") {
//             const result: any = {};
//             for (const key of Object.keys(obj)) {
//                 result[key] = this.deepSanitize(obj[key], dynamicOptions, visited);
//             }
//             return result;
//         }

//         return obj;
//     }

//     middleware(dynamicOptions?: any) {
//         return (req: any, _res: any, next: any) => {
//             try {
//                 if (req.body) {
//                     req.body = this.deepSanitize(req.body, dynamicOptions);

//                     logger.debug("sanitize-html applied", {
//                         keys: Object.keys(req.body)
//                     });
//                 }
//                 next();

//             } catch (err: any) {
//                 logger.error("sanitize-html middleware failed", {
//                     error: err?.message || err
//                 });
//                 next(err);
//             }
//         };
//     }
// }





import sanitizeHtml from "sanitize-html";
import { AdapterError } from "../core/errors/AdapterError";
import { logger } from "../logging";

export class SanitizeHtmlAdapter {
    private globalOptions: sanitizeHtml.IOptions;

    constructor(options: sanitizeHtml.IOptions = {}) {
        this.globalOptions = options;
    }

    sanitize(input: string, dynamicOptions?: any): string {
        try {
            const opts = { ...this.globalOptions, ...(dynamicOptions || {}) };
            const clean = sanitizeHtml(input, opts);

            return typeof clean === "string" ? clean : String(clean);

        } catch (err: any) {
            logger.error("HTML sanitization failed", {
                adapter: "sanitize-html",
                operation: "sanitize",
                reason: err?.message
            });

            throw new AdapterError("sanitize-html adapter failed.");
        }
    }

    // Deep Sanitization - recursively
    private deepSanitize(obj: any, dynamicOptions?: any, visited = new WeakSet()): any {
        if (obj && typeof obj === "object") {
            if (visited.has(obj)) return obj;
            visited.add(obj);
        }

        if (typeof obj === "string") {
            return this.sanitize(obj, dynamicOptions);
        }

        if (Array.isArray(obj)) {
            return obj.map(item =>
                this.deepSanitize(item, dynamicOptions, visited)
            );
        }

        if (obj && typeof obj === "object") {
            const result: any = {};
            for (const key of Object.keys(obj)) {
                result[key] = this.deepSanitize(
                    obj[key],
                    dynamicOptions,
                    visited
                );
            }
            return result;
        }

        return obj;
    }

    middleware(dynamicOptions?: any) {
        return (req: any, _res: any, next: any) => {
            try {
                if (req.body) {
                    req.body = this.deepSanitize(req.body, dynamicOptions);

                    // ✅ visible + safe info log
                    logger.info("HTML sanitization applied", {
                        adapter: "sanitize-html",
                        operation: "middleware",
                        keys: Object.keys(req.body)
                    });
                }

                next();
            } catch (err: any) {
                logger.error("HTML sanitization middleware failed", {
                    adapter: "sanitize-html",
                    operation: "middleware",
                    reason: err?.message
                });

                next(err);
            }
        };
    }
}
