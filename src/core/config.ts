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