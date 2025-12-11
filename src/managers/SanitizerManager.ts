import { SanitizerError } from "../core/errors/SanitizerError.js";
import { logger } from "../logging";

interface SanitizerAdapter {
    sanitize: (value: string, options?: any) => string;
}

export class SanitizerManager {
    private primary: SanitizerAdapter;
    private fallback: SanitizerAdapter | null;

    constructor(primary: SanitizerAdapter, fallback: SanitizerAdapter | null = null) {
        this.primary = primary;
        this.fallback = fallback;
    }

    sanitize(value: string, options?: any): string {
    
        if (typeof value !== 'string') {
            return value;
        }

        try {
            return this.primary.sanitize(value, options);
        } catch (err: any) {
            logger.warn("⚠ Primary sanitizer failed", { error: err?.message });

            if (!this.fallback) {
                throw new SanitizerError("Primary sanitizer failed and no fallback available.");
            }

            logger.info("📌 Using fallback sanitizer");
            return this.fallback.sanitize(value, options);
        }
    }

   
    middleware(options?: any) {
        return (req: any, _res: any, next: any) => {
            let fallbackTriggered = false;
            
            const safeSanitize = (value: string): string => {
                if (fallbackTriggered && this.fallback) {
                    return this.fallback.sanitize(value, options);
                }
                
                try {
                    return this.primary.sanitize(value, options);
                } catch (err: any) {
                    if (!this.fallback) {
                        throw err;
                    }
                    
                    fallbackTriggered = true;
                    logger.warn("⚠ Switching to fallback sanitizer for this request");
                    return this.fallback.sanitize(value, options);
                }
            };

            try {
                
                if (req.body && typeof req.body === "object") {
                    const originalBody = req.body;
                    const sanitizedBody: any = Array.isArray(originalBody) ? [] : {};
                    
                    for (const key of Object.keys(originalBody)) {
                        const value = originalBody[key];
                        
                        if (typeof value === "string") {
                            sanitizedBody[key] = safeSanitize(value);
                        } else if (Array.isArray(value)) {
                            sanitizedBody[key] = value.map(item => 
                                typeof item === "string" ? safeSanitize(item) : item
                            );
                        } else if (value && typeof value === "object") {
                            sanitizedBody[key] = value; 
                        } else {
                            sanitizedBody[key] = value;
                        }
                    }
                    
                    req.sanitizedBody = sanitizedBody;
                    
                    logger.debug("🧼 Request body sanitized", {
                        originalKeys: Object.keys(originalBody),
                        sanitizedKeys: Object.keys(sanitizedBody),
                        usedFallback: fallbackTriggered
                    });
                }

                next();
            } catch (err: any) {
                logger.error("❌ Sanitizer middleware failed", {
                    error: err?.message
                });
                next(new SanitizerError("Sanitizer middleware failure"));
            }
        };
    }
}