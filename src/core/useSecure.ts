// import { NormalizedOptions, normalizeOptions } from "../utils/normalizeOptions";
// import { HiSecure } from "./HiSecure";

// /**
//  * Per-route dynamic middleware builder:
//  * 
//  * router.post("/login", hisecure.use({ rateLimit: "strict" }), loginHandler)
//  */
// export function useSecure(engine: HiSecure, input?: any) {
//     if (!engine.isInitialized()) {
//         throw new Error("HiSecure must be initialized before using .use()");
//     }

//     const options: NormalizedOptions = normalizeOptions(input);
//     const chain: any[] = [];

//     // ----------------------------------------------------
//     // 1. JSON PARSER
//     // ----------------------------------------------------
//     if (options.json.enabled) {
//         chain.push(engine.jsonManager.middleware(options.json.options));
//         chain.push(engine.jsonManager.urlencoded()); // URL encoded never uses JSON options
//     }

//     // ----------------------------------------------------
//     // 2. CORS
//     // ----------------------------------------------------
//     if (options.cors.enabled) {
//         chain.push(engine.corsManager.middleware(options.cors.options));
//     }

//     // ----------------------------------------------------
//     // 3. SANITIZER
//     // ----------------------------------------------------
//     if (options.sanitize.enabled) {
//         chain.push(engine.sanitizerManager.middleware());
//     }

//     // ----------------------------------------------------
//     // 4. VALIDATION
//     // ----------------------------------------------------
//     if (options.validate.enabled && options.validate.schema) {
//         chain.push(engine.validatorManager.validate(options.validate.schema));
//     }

//     // ----------------------------------------------------
//     // 5. RATE LIMITER
//     // ----------------------------------------------------
//     // RATE LIMITER
// if (options.rateLimit.enabled) {
//     const rlOptions: any = {};

//     if (options.rateLimit.mode) {
//         rlOptions.mode = options.rateLimit.mode;
//     }

//     if (options.rateLimit.options) {
//         rlOptions.options = options.rateLimit.options;
//     }

//     chain.push(engine.rateLimitManager.middleware(rlOptions));
// }


//     return chain;
// }



// import { normalizeOptions } from "../utils/normalizeOptions";
// import { HiSecure } from "./HiSecure";

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
//         chain.push(engine.rateLimitManager.middleware({
//             mode: options.rateLimit.mode,
//             options: options.rateLimit.options
//         }));
//     }

//     // AUTH (NEW)
//     if (options.auth.enabled) {
//         if (!engine.authManager) {
//             throw new Error("AuthManager not initialized. Enable auth in config.");
//         }

//         chain.push(
//             engine.authManager.protect({
//                 required: options.auth.options.required
//             })
//         );
//     }

//     return chain;
// }





import { normalizeOptions } from "../utils/normalizeOptions";
import { HiSecure } from "./HiSecure";

export function useSecure(engine: HiSecure, input?: any) {
    if (!engine.isInitialized()) {
        throw new Error("HiSecure must be initialized before using .use()");
    }

    const options = normalizeOptions(input);
    const chain: any[] = [];

    // JSON
    if (options.json.enabled) {
        chain.push(engine.jsonManager.middleware(options.json.options));
        chain.push(engine.jsonManager.urlencoded());
    }

    // CORS
    if (options.cors.enabled) {
        chain.push(engine.corsManager.middleware(options.cors.options));
    }

    // Sanitize
    if (options.sanitize.enabled) {
        chain.push(engine.sanitizerManager.middleware());
    }

    // Validate
    if (options.validate.enabled && options.validate.schema) {
        chain.push(engine.validatorManager.validate(options.validate.schema));
    }

    // Rate Limit
    if (options.rateLimit.enabled) {
        chain.push(
            engine.rateLimitManager.middleware({
                mode: options.rateLimit.mode ?? undefined,
                options: options.rateLimit.options ?? undefined
            })
        );
    }

    // AUTH
    if (options.auth.enabled) {
        if (!engine.authManager) {
            throw new Error("AuthManager not initialized. Enable auth in config.");
        }

        chain.push(
            engine.authManager.protect({
                required: options.auth.required
            })
        );
    }

    return chain;
}
