

// export interface HiSecureConfig {
//     enableHelmet: boolean;
//     enableHPP: boolean;
//     enableCORS: boolean;
//     enableSanitizer: boolean;
//     enableRateLimiter: boolean;
//     enableValidation: boolean;

//     hashing: {
//         primary: "argon2" | "bcrypt";
//         fallback: "bcrypt" | null;
//         saltRounds: number;
//     };

//     rateLimiter: {
//         windowMs: number;
//         maxRequests: number;
//         message: string;
//         useAdaptiveMode: boolean;
//     };

//     validation: {
//         mode: "zod" | "express-validator";
//         fallback: "express-validator" | null;
//     };

//     sanitizer: {
//         allowedTags: string[];
//         allowedAttributes: Record<string, string[]>;
//     };

//     logging: {
//         enabled: boolean;
//         level: "info" | "warn" | "error" | "debug";
//     };

//     /** 🔥 ADD THIS */
//     auth: {
//         enabled: boolean;
//         jwtExpiresIn: string | number | undefined;
//     };

//     /** 🔥 optional configs for dynamic JSON/CORS */
//     json?: any;
//     urlencoded?: any;
//     cors?: any;
// }




// export const defaultConfig: HiSecureConfig = {
//     enableHelmet: true,
//     enableHPP: true,
//     enableCORS: true,
//     enableSanitizer: true,
//     enableRateLimiter: true,
//     enableValidation: true,

//     hashing: {
//         primary: "argon2",
//         fallback: "bcrypt",
//         saltRounds: 10,
//     },

//     rateLimiter: {
//         windowMs: 15 * 60 * 1000,
//         maxRequests: 100,
//         message: "Too many requests, please try again later.",
//         useAdaptiveMode: false,
//     },

//     validation: {
//         mode: "zod",
//         fallback: "express-validator",
//     },

//     sanitizer: {
//         allowedTags: ["b", "i", "em", "strong", "a"],
//         allowedAttributes: { a: ["href"] },
//     },

//     logging: {
//         enabled: true,
//         level: "info",
//     },

//     /** 🔥 NEW AUTH CONFIG */
//     auth: {
//         enabled: false,            // user enables manually
//         jwtExpiresIn: "1d",        // default value
//     },

//     /** Optional parser configs */
//     json: {},
//     urlencoded: { extended: true },
//     cors: {},
// };




// src/core/config.ts
import { HiSecureConfig } from "./types/HiSecureConfig";

export const defaultConfig: HiSecureConfig = {
    enableHelmet: true,
    enableHPP: true,
    enableCORS: true,
    enableSanitizer: true,
    enableRateLimiter: true,
    enableValidation: true,
    enableCompression: true,
    
    hashing: {
        primary: "argon2",
        fallback: "bcrypt",
        saltRounds: 10,
    },
    
    rateLimiter: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        message: "Too many requests, please try again later.",
        useAdaptiveMode: false,
    },
    
    validation: {
        mode: "zod",
        fallback: "express-validator",
    },
    
    sanitizer: {
        allowedTags: ["b", "i", "em", "strong", "a"],
        allowedAttributes: { a: ["href"] },
        fallback: 'escape',
        primary: 'sanitize-html'
    },
    
    logging: {
        enabled: true,
        level: "info",
        maxSize: 5 * 1024 * 1024,
    },
    
    auth: {
        enabled: false,
    },
    
    json: { limit: '1mb' },
    urlencoded: { extended: true },
    cors: {},
    compression: {},
};