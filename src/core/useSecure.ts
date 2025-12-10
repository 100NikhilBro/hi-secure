// import { normalizeOptions } from "../utils/normalizeOptions.js";
// import { HiSecure } from "./HiSecure.js";

// export function useSecure(engine: HiSecure, input?: any) {
//     if (!engine.isInitialized()) {
//         throw new Error("HiSecure must be initialized before using .use()");
//     }

//     const options = normalizeOptions(input);
//     const chain: any[] = [];

//     // JSON
//     if (options.json.enabled) {
//         chain.push(engine.jsonManager.middleware(options.json.options));
//         chain.push(engine.jsonManager.urlencoded());
//     }

//     // CORS
//     if (options.cors.enabled) {
//         chain.push(engine.corsManager.middleware(options.cors.options));
//     }

//     // Sanitize
//     if (options.sanitize.enabled) {
//         chain.push(engine.sanitizerManager.middleware());
//     }

//     // Validate
//     if (options.validate.enabled && options.validate.schema) {
//         chain.push(engine.validatorManager.validate(options.validate.schema));
//     }

//     // Rate Limit
//     if (options.rateLimit.enabled) {
//         chain.push(
//             engine.rateLimitManager.middleware({
//                 mode: options.rateLimit.mode ?? undefined,
//                 options: options.rateLimit.options ?? undefined
//             })
//         );
//     }

//     // AUTH
//     if (options.auth.enabled) {
//         if (!engine.authManager) {
//             throw new Error("AuthManager not initialized. Enable auth in config.");
//         }

//         chain.push(
//             engine.authManager.protect({
//                 required: options.auth.required
//             })
//         );
//     }

//     return chain;
// }



// src/core/useSecure.ts - SIMPLER VERSION
// This is now optional since HiSecure class has fluent API

import { HiSecure } from "./HiSecure.js";
import { SecureOptions } from "./types/SecureOptions.js";

/**
 * @deprecated Use HiSecure.middleware() or fluent API instead
 */
export function useSecure(options?: SecureOptions | "api" | "strict" | "public") {
    console.warn("⚠ useSecure() is deprecated. Use HiSecure.middleware() or fluent API methods.");
    return HiSecure.middleware(options);
}

/**
 * Legacy support - route-level security
 */
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