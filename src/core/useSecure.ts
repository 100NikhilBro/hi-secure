import { HiSecure } from "./HiSecure.js";
import { SecureOptions } from "./types/SecureOptions.js";

/**
 * @deprecated Use HiSecure.middleware() or fluent API instead
 */

export function useSecure(options?: SecureOptions | "api" | "strict" | "public") {
    console.warn("⚠ useSecure() is deprecated. Use HiSecure.middleware() or fluent API methods.");
    return HiSecure.middleware(options);
}


//  Legacy support - route-level security


export function secureRoute(options?: SecureOptions) {
    const chain: any[] = [];
    
    if (options?.cors) {
        chain.push(HiSecure.cors(
            typeof options.cors === 'object' ? options.cors : undefined
        ));
    }
    
    if (options?.rateLimit) {
        chain.push(HiSecure.rateLimit(
            typeof options.rateLimit === 'object' ? options.rateLimit : 
            options.rateLimit === "strict" ? "strict" : "relaxed"
        ));
    }
    
    if (options?.sanitize) {
        chain.push(HiSecure.sanitize(
            typeof options.sanitize === 'object' ? options.sanitize : undefined
        ));
    }
    
    if (options?.validate) {
        chain.push(HiSecure.validate(options.validate));
    }
    
    if (options?.auth) {
        chain.push(HiSecure.auth(
            typeof options.auth === 'object' ? options.auth : undefined
        ));
    }
    
    return chain;
}


