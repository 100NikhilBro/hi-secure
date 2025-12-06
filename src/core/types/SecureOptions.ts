// // export interface  SecureOptions{
// //     cors?: boolean | object;
// //     rateLimit?:boolean | "strict" | "relaxed" | object;
// //     sanitize?:boolean;
// //     validate?:any;
// //     json?:any;
// // }


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
// }




// src/core/types/SecureOptions.ts

export interface SecureOptions {
    /** Enable/override CORS for this route */
    cors?: boolean | object;

    /** Per-route rate limit */
    rateLimit?: boolean | "strict" | "relaxed" | object;

    /** Sanitize request body */
    sanitize?: boolean;

    /** Validation schema (Zod or express-validator) */
    validate?: any;

    /** Auto-JSON parsing (express.json) options */
    json?: boolean | object;

    /** NEW: Per-route authentication (JWT protect) */
    auth?: boolean | { required?: boolean };
}
