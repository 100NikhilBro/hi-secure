// // src/core/types/SecureOptions.ts

// export interface SecureOptions {
//     /** Enable/override CORS for this route */
//     cors?: boolean | object;

//     /** Per-route rate limit */
//     rateLimit?: boolean | "strict" | "relaxed" | object;

//     /** Sanitize request body */
//     sanitize?: boolean;

//     /** Validation schema (Zod or express-validator) */
//     validate?: any;

//     /** Auto-JSON parsing (express.json) options */
//     json?: boolean | object;

//     /** NEW: Per-route authentication (JWT protect) */
//     auth?: boolean | { required?: boolean };
// }





// src/core/types/SecureOptions.ts
import { z, ZodSchema } from 'zod';
import { ValidationChain } from 'express-validator';

export type ValidationSchema = ZodSchema | ValidationChain[];

export interface RateLimitOptions {
    windowMs?: number;
    max?: number;
    message?: string;
    skipFailedRequests?: boolean;
    [key: string]: any;
}

export interface SanitizeOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    [key: string]: any;
}

export interface AuthOptions {
    required?: boolean;
    roles?: string[];
}

export interface SecureOptions {
    cors?: boolean | object;
    rateLimit?: boolean | "strict" | "relaxed" | RateLimitOptions;
    sanitize?: boolean | SanitizeOptions;
    validate?: ValidationSchema;
    json?: boolean | object;
    auth?: boolean | AuthOptions;
    compression?: boolean | object;
    headers?: boolean | object;
}