// import jwt from "jsonwebtoken";
// import { randomUUID } from "crypto";
// import { AdapterError } from "../core/errors/AdapterError";
// import { logger } from "../logging";

// export interface JWTAdapterOptions {
//     secret: string;
//     expiresIn?: string | number;
//     algorithm?: jwt.Algorithm;
//     issuer?: string;
//     audience?: string | string[];
// }

// export interface SignOptions {
//     expiresIn?: string | number;
//     jti?: string;
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
//             logger.warn("Weak JWT secret detected", {
//                 adapter: "jwt",
//                 operation: "init",
//                 secretLength: options.secret.length
//             });
//         }

//         this.secret = options.secret;
//         this.expiresIn = options.expiresIn;
//         this.algorithm = options.algorithm || "HS256";
//         this.issuer = options.issuer;
//         this.audience = options.audience;
//     }

//     sign(payload: object, options?: SignOptions) {
//         try {
//             const jwtOptions: jwt.SignOptions = {
//                 algorithm: this.algorithm,
//                 issuer: options?.issuer || this.issuer,
//                 audience: options?.audience || this.audience,
//                 jwtid: options?.jti || randomUUID(),
//                 subject: options?.subject
//             };

//             if (options?.expiresIn !== undefined) {
//                 jwtOptions.expiresIn = options.expiresIn as any;
//             } else if (this.expiresIn !== undefined) {
//                 jwtOptions.expiresIn = this.expiresIn as any;
//             }

//             return jwt.sign(payload, this.secret, jwtOptions);

//         } catch (err: any) {
//             logger.error("JWT signing failed", {
//                 adapter: "jwt",
//                 operation: "sign",
//                 reason: err?.message
//             });

//             throw new AdapterError("JWT sign failed");
//         }
//     }

//     verify(token: string, options?: { audience?: string | string[] }) {
//         try {
//             const verifyOptions: jwt.VerifyOptions = {
//                 algorithms: [this.algorithm],
//                 issuer: this.issuer,
//                 audience: (options?.audience || this.audience) as string
//             };

//             return jwt.verify(token, this.secret, verifyOptions);

//         } catch (err: any) {
//             logger.error("JWT verification failed", {
//                 adapter: "jwt",
//                 operation: "verify",
//                 reason: err?.message
//             });

//             if (err?.name === "TokenExpiredError") {
//                 throw new AdapterError("JWT token has expired");
//             }

//             if (err?.name === "JsonWebTokenError") {
//                 throw new AdapterError("Invalid JWT token");
//             }

//             throw new AdapterError("JWT verification failed");
//         }
//     }
// }



import jwt, { SignOptions as JwtSignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { AdapterError } from "../core/errors/AdapterError";
import { logger } from "../logging";

type ExpiresIn = JwtSignOptions["expiresIn"];

export interface JWTAdapterOptions {
  secret: string;
  expiresIn?: string | number;
  algorithm?: jwt.Algorithm;
  issuer?: string;
  audience?: string | string[];
}

export interface SignOptions {
  expiresIn?: string | number;
  jti?: string;
  subject?: string;
  issuer?: string;
  audience?: string | string[];
}

function normalizeAudience(
  aud?: string | string[]
): string | [string, ...string[]] | undefined {
  if (!aud) return undefined;
  if (typeof aud === "string") return aud;
  if (aud.length > 0) return aud as [string, ...string[]];
  return undefined;
}

export class JWTAdapter {
  private secret: string;
  private expiresIn?: ExpiresIn;
  private algorithm: jwt.Algorithm;
  private issuer?: string;
  private audience?: string | string[];

  constructor(options: JWTAdapterOptions) {
    if (!options.secret) {
      throw new AdapterError("JWT secret is required");
    }

    if (options.secret.length < 32) {
      logger.warn("Weak JWT secret detected", {
        adapter: "jwt",
        secretLength: options.secret.length
      });
    }

    this.secret = options.secret;
    this.algorithm = options.algorithm ?? "HS256";
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.expiresIn = options.expiresIn as ExpiresIn;
  }

  // ================= SIGN =================
  sign(payload: object, options?: SignOptions) {
    try {
      const jwtOptions: jwt.SignOptions = {
        algorithm: this.algorithm,
        jwtid: options?.jti ?? randomUUID()
      };

      // ✅ subject ONLY if string
      if (typeof options?.subject === "string") {
        jwtOptions.subject = options.subject;
      }

      // ✅ issuer
      const issuer = options?.issuer ?? this.issuer;
      if (typeof issuer === "string") {
        jwtOptions.issuer = issuer;
      }

      // ✅ audience
      const audience = normalizeAudience(options?.audience ?? this.audience);
      if (audience) jwtOptions.audience = audience;

      // ✅ expiresIn
      const expires =
        options?.expiresIn !== undefined
          ? (options.expiresIn as ExpiresIn)
          : this.expiresIn;

      if (expires !== undefined) {
        jwtOptions.expiresIn = expires;
      }

      return jwt.sign(payload, this.secret, jwtOptions);
    } catch (err: any) {
      logger.error("JWT signing failed", {
        adapter: "jwt",
        operation: "sign",
        reason: err?.message
      });
      throw new AdapterError("JWT sign failed");
    }
  }

  // ================= VERIFY =================
  verify(token: string, options?: { audience?: string | string[] }) {
    try {
      const verifyOptions: jwt.VerifyOptions = {
        algorithms: [this.algorithm]
      };

      if (typeof this.issuer === "string") {
        verifyOptions.issuer = this.issuer;
      }

      const audience = normalizeAudience(options?.audience ?? this.audience);
      if (audience) verifyOptions.audience = audience;

      return jwt.verify(token, this.secret, verifyOptions);
    } catch (err: any) {
      logger.error("JWT verification failed", {
        adapter: "jwt",
        operation: "verify",
        reason: err?.message
      });

      if (err?.name === "TokenExpiredError") {
        throw new AdapterError("JWT token has expired");
      }

      if (err?.name === "JsonWebTokenError") {
        throw new AdapterError("Invalid JWT token");
      }

      throw new AdapterError("JWT verification failed");
    }
  }
}
