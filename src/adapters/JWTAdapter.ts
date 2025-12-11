// // import jwt from "jsonwebtoken";
// // import { AdapterError } from "../core/errors/AdapterError";
// // import { logError } from "../logging";

// // export interface JWTAdapterOptions {
// //     secret: string;
// //     expiresIn?: string | number | undefined;
// // }

// // export class JWTAdapter {
// //     private secret: string;
// //     private expiresIn?: string | number;

// //     constructor(options: JWTAdapterOptions) {
// //         if (!options.secret) {
// //             throw new AdapterError("JWT secret is required");
// //         }

// //         this.secret = options.secret;

// //         // Normalize expiresIn
// //         if (options.expiresIn !== undefined) {
// //             this.expiresIn = options.expiresIn as string | number;
// //         }
// //     }

// //     sign(
// //         payload: object,
// //         options?: { expiresIn?: string | number }
// //     ) {
// //         try {
// //             const finalExpires =
// //                 options?.expiresIn ?? this.expiresIn;

// //             const jwtOptions: jwt.SignOptions = {};

// //             if (finalExpires !== undefined) {
// //                 // Force safe cast → matches SignOptions type
// //                 jwtOptions.expiresIn = finalExpires as number | any;
// //             }

// //             return jwt.sign(payload, this.secret, jwtOptions);

// //         } catch (err: any) {
// //             logError("JWTAdapter.sign failed", { error: err?.message });
// //             throw new AdapterError(err?.message || "JWT sign failed");
// //         }
// //     }

// //     verify(token: string) {
// //         try {
// //             return jwt.verify(token, this.secret);
// //         } catch (err: any) {
// //             logError("JWTAdapter.verify failed", { error: err?.message });
// //             throw new AdapterError(err?.message || "JWT verify failed");
// //         }
// //     }
// // }



// // // src/adapters/JWTAdapter.ts - FIXED (Security hardening)
// // import jwt from "jsonwebtoken";
// // import { v4 as uuidv4 } from "uuid";
// // import { AdapterError } from "../core/errors/AdapterError.js";
// // import { logError } from "../logging/index.js";

// // export interface JWTAdapterOptions {
// //     secret: string;
// //     expiresIn?: string | number;
// //     algorithm?: jwt.Algorithm;
// //     issuer?: string;
// //     audience?: string | string[];
// // }

// // export interface SignOptions {
// //     expiresIn?: string | number;
// //     jti?: string; // JWT ID for token revocation
// //     subject?: string;
// //     issuer?: string;
// //     audience?: string | string[];
// // }

// // export class JWTAdapter {
// //     private secret: string;
// //     private expiresIn?: string | number;
// //     private algorithm: jwt.Algorithm;
// //     private issuer?: string;
// //     private audience?: string | string[];

// //     constructor(options: JWTAdapterOptions) {
// //         if (!options.secret) {
// //             throw new AdapterError("JWT secret is required");
// //         }

// //         if (options.secret.length < 32) {
// //             logError("⚠ JWT secret is too short (minimum 32 characters recommended)");
// //         }

// //         this.secret = options.secret;
// //         this.expiresIn = options.expiresIn;
// //         this.algorithm = options.algorithm || 'HS256'; // ⚠️ Default algorithm
// //         this.issuer = options.issuer;
// //         this.audience = options.audience;
// //     }

// //     sign(payload: object, options?: SignOptions) {
// //         try {
// //             const jwtOptions: jwt.SignOptions = {
// //                 algorithm: this.algorithm,
// //                 issuer: options?.issuer || this.issuer,
// //                 audience: options?.audience || this.audience,
// //                 jwtid: options?.jti || uuidv4(), // Unique token ID
// //                 subject: options?.subject
// //             };

// //             if (options?.expiresIn !== undefined) {
// //                 jwtOptions.expiresIn = options.expiresIn as number;
// //             } else if (this.expiresIn !== undefined) {
// //                 jwtOptions.expiresIn = this.expiresIn as number;
// //             }

// //             return jwt.sign(payload, this.secret, jwtOptions);

// //         } catch (err: any) {
// //             logError("JWTAdapter.sign failed", { error: err?.message });
// //             throw new AdapterError(err?.message || "JWT sign failed");
// //         }
// //     }

// //     verify(token: string, options?: { audience?: string | string[] }) {
// //         try {
// //             const verifyOptions: jwt.VerifyOptions = {
// //                 algorithms: [this.algorithm],
// //                 issuer: this.issuer,
// //                 audience: options?.audience as string || this.audience as string
// //             };

// //             return jwt.verify(token, this.secret, verifyOptions);
// //         } catch (err: any) {
// //             logError("JWTAdapter.verify failed", { error: err?.message });
            
// //             // Provide better error messages
// //             if (err.name === 'TokenExpiredError') {
// //                 throw new AdapterError("JWT token has expired");
// //             }
// //             if (err.name === 'JsonWebTokenError') {
// //                 throw new AdapterError("Invalid JWT token");
// //             }
            
// //             throw new AdapterError(err?.message || "JWT verification failed");
// //         }
// //     }
// // }


// // src/adapters/JWTAdapter.ts - FIXED (Security hardening)
// import jwt from "jsonwebtoken";
// import { nanoid } from "nanoid";  // CHANGED: from uuid to nanoid
// import { AdapterError } from "../core/errors/AdapterError.js";
// import { logError } from "../logging/index.js";

// export interface JWTAdapterOptions {
//     secret: string;
//     expiresIn?: string | number;
//     algorithm?: jwt.Algorithm;
//     issuer?: string;
//     audience?: string | string[];
// }

// export interface SignOptions {
//     expiresIn?: string | number;
//     jti?: string; // JWT ID for token revocation
//     subject?: string;
//     issuer?: string;
//     audience?: string | string[];
// }

// export class JWTAdapter {
//     private secret: string;
//     private expiresIn?: string | number;
//     private algorithm: jwt.Algorithm;
//     private issuer?: string;
//     private audience?: string | string[];

//     constructor(options: JWTAdapterOptions) {
//         if (!options.secret) {
//             throw new AdapterError("JWT secret is required");
//         }

//         if (options.secret.length < 32) {
//             logError("⚠ JWT secret is too short (minimum 32 characters recommended)");
//         }

//         this.secret = options.secret;
//         this.expiresIn = options.expiresIn;
//         this.algorithm = options.algorithm || 'HS256'; // ⚠️ Default algorithm
//         this.issuer = options.issuer;
//         this.audience = options.audience;
//     }

//     sign(payload: object, options?: SignOptions) {
//         try {
//             const jwtOptions: jwt.SignOptions = {
//                 algorithm: this.algorithm,
//                 issuer: options?.issuer || this.issuer,
//                 audience: options?.audience || this.audience,
//                 jwtid: options?.jti || nanoid(),  // CHANGED: uuidv4() to nanoid()
//                 subject: options?.subject
//             };

//             if (options?.expiresIn !== undefined) {
//                 jwtOptions.expiresIn = options.expiresIn as number;
//             } else if (this.expiresIn !== undefined) {
//                 jwtOptions.expiresIn = this.expiresIn as number;
//             }

//             return jwt.sign(payload, this.secret, jwtOptions);

//         } catch (err: any) {
//             logError("JWTAdapter.sign failed", { error: err?.message });
//             throw new AdapterError(err?.message || "JWT sign failed");
//         }
//     }

//     verify(token: string, options?: { audience?: string | string[] }) {
//         try {
//             const verifyOptions: jwt.VerifyOptions = {
//                 algorithms: [this.algorithm],
//                 issuer: this.issuer,
//                 audience: options?.audience as string || this.audience as string
//             };

//             return jwt.verify(token, this.secret, verifyOptions);
//         } catch (err: any) {
//             logError("JWTAdapter.verify failed", { error: err?.message });
            
//             // Provide better error messages
//             if (err.name === 'TokenExpiredError') {
//                 throw new AdapterError("JWT token has expired");
//             }
//             if (err.name === 'JsonWebTokenError') {
//                 throw new AdapterError("Invalid JWT token");
//             }
            
//             throw new AdapterError(err?.message || "JWT verification failed");
//         }
//     }
// }




// src/adapters/JWTAdapter.ts - FIXED (Using crypto.randomUUID())
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";  // Built-in Node.js
import { AdapterError } from "../core/errors/AdapterError.js";
import { logError } from "../logging/index.js";
import { logger } from "../logging";

export interface JWTAdapterOptions {
    secret: string;
    expiresIn?: string | number;
    algorithm?: jwt.Algorithm;
    issuer?: string;
    audience?: string | string[];
}

export interface SignOptions {
    expiresIn?: string | number;
    jti?: string; // JWT ID for token revocation
    subject?: string;
    issuer?: string;
    audience?: string | string[];
}

export class JWTAdapter {
    private secret: string;
    private expiresIn?: string | number;
    private algorithm: jwt.Algorithm;
    private issuer?: string;
    private audience?: string | string[];

    constructor(options: JWTAdapterOptions) {
        if (!options.secret) {
            throw new AdapterError("JWT secret is required");
        }

        if (options.secret.length < 32) {
            logger.warn("🚨 JWT secret shorter than 32 chars. Consider using stronger secret.");
            // logError("⚠ JWT secret is too short (minimum 32 characters recommended)");
        }

        this.secret = options.secret;
        this.expiresIn = options.expiresIn;
        this.algorithm = options.algorithm || 'HS256'; // ⚠️ Default algorithm
        this.issuer = options.issuer;
        this.audience = options.audience;
    }

    sign(payload: object, options?: SignOptions) {
        try {
            const jwtOptions: jwt.SignOptions = {
                algorithm: this.algorithm,
                issuer: options?.issuer || this.issuer,
                audience: options?.audience || this.audience,
                jwtid: options?.jti || randomUUID(),  // ✅ Using crypto.randomUUID()
                subject: options?.subject
            };

            if (options?.expiresIn !== undefined) {
                jwtOptions.expiresIn = options.expiresIn as number;
            } else if (this.expiresIn !== undefined) {
                jwtOptions.expiresIn = this.expiresIn as number;
            }

            return jwt.sign(payload, this.secret, jwtOptions);

        } catch (err: any) {
            logError("JWTAdapter.sign failed", { error: err?.message });
            throw new AdapterError(err?.message || "JWT sign failed");
        }
    }

    verify(token: string, options?: { audience?: string | string[] }) {
        try {
            const verifyOptions: jwt.VerifyOptions = {
                algorithms: [this.algorithm],
                issuer: this.issuer,
                audience: options?.audience as string || this.audience as string
            };

            return jwt.verify(token, this.secret, verifyOptions);
        } catch (err: any) {
            logError("JWTAdapter.verify failed", { error: err?.message });
            
            // Provide better error messages
            if (err.name === 'TokenExpiredError') {
                throw new AdapterError("JWT token has expired");
            }
            if (err.name === 'JsonWebTokenError') {
                throw new AdapterError("Invalid JWT token");
            }
            
            throw new AdapterError(err?.message || "JWT verification failed");
        }
    }
}