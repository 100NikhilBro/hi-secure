import { FilterXSS, getDefaultWhiteList, whiteList } from 'xss';
import { AdapterError } from "../core/errors/AdapterError.js";
import { logger } from "../logging/index.js";

export interface XSSOptions {
    whiteList?: typeof whiteList;
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: string[];
    allowCommentTag?: boolean;
    css?: boolean | { [key: string]: boolean };
    onTag?: (tag: string, html: string, options: any) => string;
    onTagAttr?: (tag: string, name: string, value: string, isWhiteAttr: boolean) => string;
    onIgnoreTag?: (tag: string, html: string, options: any) => string;
    [key: string]: any;
}

export class XSSAdapter {
    private globalOptions: XSSOptions;
    private defaultFilter: FilterXSS;

    constructor(options: XSSOptions = {}) {
        this.globalOptions = options;
        
        // Default safe configuration
        const defaultOptions: XSSOptions = {
            whiteList: getDefaultWhiteList(),
            stripIgnoreTag: true, 
            stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
            allowCommentTag: false,
            css: false, 
            onTag: (tag, html, options) => {
               
                if (tag === 'a') {
                    return html.replace(/<a /i, '<a target="_blank" rel="noopener noreferrer" ');
                }
                return html;
            }
        };

        const finalOptions = { ...defaultOptions, ...options };
        this.defaultFilter = new FilterXSS(finalOptions);
    }

   
    sanitize(input: string, dynamicOptions?: XSSOptions): string {
        try {
            if (typeof input !== "string") {
                return input as any;
            }

           
            if (!dynamicOptions || Object.keys(dynamicOptions).length === 0) {
                return this.defaultFilter.process(input);
            }

            
            const mergedOptions = { ...this.globalOptions, ...dynamicOptions };
            const customFilter = new FilterXSS(mergedOptions);
            
            return customFilter.process(input);

        } catch (err: any) {
            logger.error("XSS sanitizer failed", {
                error: err?.message,
                preview: input?.slice?.(0, 80)
            });
            throw new AdapterError("XSS sanitizer failed.");
        }
    }

   
    middleware(dynamicOptions?: XSSOptions) {
        return (req: any, _res: any, next: any) => {
            try {
                if (req.body && typeof req.body === "object") {
                    const originalBody = req.body;
                    const sanitizedBody: any = Array.isArray(originalBody) ? [] : {};
                    
                    for (const key of Object.keys(originalBody)) {
                        const val = originalBody[key];

                        if (typeof val === "string") {
                            sanitizedBody[key] = this.sanitize(val, dynamicOptions);
                        } else if (Array.isArray(val)) {
                            sanitizedBody[key] = val.map((v) =>
                                typeof v === "string"
                                    ? this.sanitize(v, dynamicOptions)
                                    : v
                            );
                        } else if (val && typeof val === "object") {
                            
                            sanitizedBody[key] = this.deepSanitize(val, dynamicOptions);
                        } else {
                            sanitizedBody[key] = val;
                        }
                    }
                    
                   
                    req.sanitizedBody = sanitizedBody;
                    
                    logger.debug("XSS sanitizer applied", {
                        originalKeys: Object.keys(originalBody),
                        sanitizedKeys: Object.keys(sanitizedBody)
                    });
                }

                next();
            } catch (err: any) {
                logger.error("XSS middleware failed", {
                    error: err?.message || err
                });
                next(err);
            }
        };
    }

   
    private deepSanitize(obj: any, options?: XSSOptions, visited = new WeakSet()): any {
       
        if (obj && typeof obj === "object") {
            if (visited.has(obj)) {
                return obj;
            }
            visited.add(obj);
        }

        if (typeof obj === "string") {
            return this.sanitize(obj, options);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.deepSanitize(item, options, visited));
        }

        if (obj && typeof obj === "object") {
            const result: any = {};
            for (const key of Object.keys(obj)) {
                result[key] = this.deepSanitize(obj[key], options, visited);
            }
            return result;
        }

        return obj;
    }
}