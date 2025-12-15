export interface HiSecureConfig {
    // Core security features
    enableHelmet: boolean;
    enableHPP: boolean;
    enableCORS: boolean;
    enableSanitizer: boolean;
    enableRateLimiter: boolean;
    enableValidation: boolean;
    enableCompression: boolean;
    
    // Hashing configuration
    hashing: {
        primary: "argon2" | "bcrypt";
        fallback: "bcrypt" | null;
        saltRounds: number;
    };
    
    // Rate limiting
    rateLimiter: {
        windowMs: number;
        maxRequests: number;
        message: string;
        useAdaptiveMode: boolean;
    };
    
    // Validation
    validation: {
        mode: "zod" | "express-validator";
        fallback: "express-validator" | null;
    };
    
    // Sanitization
    sanitizer: {
        allowedTags: string[];
        allowedAttributes: Record<string, string[]>;
        fallback: 'escape' | 'xss' | 'none';
        primary: 'sanitize-html' | 'xss';
    };
    
    // Logging
    logging: {
        enabled: boolean;
        level: "info" | "warn" | "error" | "debug";
        file?: string;
        maxSize?: number;
    };
    
    // Authentication
    auth: {
        enabled: boolean;
        jwtSecret?: string;
        jwtExpiresIn?: string | number;
        googleClientId?: string;
    };
    
    // Optional parsers
    json?: object;
    urlencoded?: object;
    cors?: object;
    compression?: object;
}