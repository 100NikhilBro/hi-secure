// import { SecureOptions } from "../core/types/SecureOptions";

// export interface NormalizedOptions {
//     cors: { enabled: boolean; options?: any };
//     rateLimit: { enabled: boolean; mode?: "strict" | "relaxed"; options?: any };
//     sanitize: { enabled: boolean };
//     validate: { enabled: boolean; schema?: any };
//     json: { enabled: boolean; options?: any };

//     /** NEW */
//     auth: { enabled: boolean; required: boolean };
// }

// export function normalizeOptions(input?: SecureOptions | false): NormalizedOptions {
//     if (input === false) {
//         return {
//             cors: { enabled: false },
//             rateLimit: { enabled: false },
//             sanitize: { enabled: false },
//             validate: { enabled: false },
//             json: { enabled: false },

//             // NEW AUTH
//             auth: { enabled: false, required: true }
//         };
//     }

//     const opts = input || {};

//     return {
//         cors: {
//             enabled: opts.cors === undefined ? true : opts.cors !== false,
//             options: typeof opts.cors === "object" ? opts.cors : undefined
//         },

//         rateLimit: normalizeRateLimit(opts.rateLimit),

//         sanitize: {
//             enabled: opts.sanitize === undefined ? true : opts.sanitize !== false
//         },

//         validate: {
//             enabled: !!opts.validate,
//             schema: opts.validate || undefined
//         },

//         json: {
//             enabled: opts.json === undefined ? true : opts.json !== false,
//             options: typeof opts.json === "object" ? opts.json : undefined
//         },

//         /** NEW AUTH NORMALIZATION */
//         auth: normalizeAuth(opts.auth)
//     };
// }






// // ------------------------------------------
// // ONLY RATE LIMITER — (UNCHANGED)
// // ------------------------------------------
// function normalizeRateLimit(value: SecureOptions["rateLimit"]) {
//     if (value === false) return { enabled: false };

//     if (value === "strict")
//         return { enabled: true, mode: "strict", options: { max: 5, windowMs: 10000 } };

//     if (value === "relaxed")
//         return { enabled: true, mode: "relaxed", options: { max: 100, windowMs: 60000 } };

//     if (typeof value === "object")
//         return { enabled: true, options: value };

//     return { enabled: true };
// }

// // ------------------------------------------
// // NEW AUTH NORMALIZER
// // ------------------------------------------
// function normalizeAuth(value: SecureOptions["auth"]) {
//     if (value === false) return { enabled: false, required: true };

//     if (value === true || value === undefined)
//         return { enabled: true, required: true };

//     return {
//         enabled: true,
//         required: value.required !== false // default → required:true
//     };
// }



import { SecureOptions } from "../core/types/SecureOptions";

export interface NormalizedOptions {
    cors: { enabled: boolean; options?: any };
    rateLimit: { enabled: boolean; mode?: "strict" | "relaxed" | undefined; options?: any };
    sanitize: { enabled: boolean };
    validate: { enabled: boolean; schema?: any };
    json: { enabled: boolean; options?: any };

    /** NEW */
    auth: { enabled: boolean; required: boolean };
}

export function normalizeOptions(input?: SecureOptions | false): NormalizedOptions {
    if (input === false) {
        return {
            cors: { enabled: false },
            rateLimit: { enabled: false, mode: undefined, options: undefined },
            sanitize: { enabled: false },
            validate: { enabled: false },
            json: { enabled: false },
            auth: { enabled: false, required: true }
        };
    }

    const opts = input || {};

    return {
        cors: {
            enabled: opts.cors === undefined ? true : opts.cors !== false,
            options: typeof opts.cors === "object" ? opts.cors : undefined
        },

        rateLimit: normalizeRateLimit(opts.rateLimit),

        sanitize: {
            enabled: opts.sanitize === undefined ? true : opts.sanitize !== false
        },

        validate: {
            enabled: !!opts.validate,
            schema: opts.validate || undefined
        },

        json: {
            enabled: opts.json === undefined ? true : opts.json !== false,
            options: typeof opts.json === "object" ? opts.json : undefined
        },

        auth: normalizeAuth(opts.auth)
    };
}

// ---------------------------------------------------------------
// RATE LIMIT — EXACT TYPES, NO TS ERROR
// ---------------------------------------------------------------
function normalizeRateLimit(value: SecureOptions["rateLimit"]): {
    enabled: boolean;
    mode?: "strict" | "relaxed" | undefined;
    options?: any;
} {
    if (value === false) {
        return { enabled: false, mode: undefined, options: undefined };
    }

    if (value === "strict") {
        return {
            enabled: true,
            mode: "strict",
            options: { max: 5, windowMs: 10000 }
        };
    }

    if (value === "relaxed") {
        return {
            enabled: true,
            mode: "relaxed",
            options: { max: 100, windowMs: 60000 }
        };
    }

    if (typeof value === "object") {
        return {
            enabled: true,
            mode: undefined,   // VERY IMPORTANT!
            options: value
        };
    }

    // Default → enabled and optional fields omitted
    return {
        enabled: true,
        mode: undefined,
        options: undefined
    };
}

// ---------------------------------------------------------------
// AUTH NORMALIZER — EXACT FOR useSecure
// ---------------------------------------------------------------
function normalizeAuth(value: SecureOptions["auth"]) {
    if (value === false) return { enabled: false, required: true };

    if (value === true || value === undefined)
        return { enabled: true, required: true };

    return {
        enabled: true,
        required: value.required !== false
    };
}
