import { JWTAdapter } from "../adapters/JWTAdapter.js";
import { GoogleAdapter } from "../adapters/GoogleAdapter.js";
import { AdapterError } from "../core/errors/AdapterError.js";
import { HttpError } from "../core/errors/HttpError.js";
import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";


export interface AuthOptions {
    jwtSecret: string;
    jwtExpiresIn?: string | number;
    googleClientId?: string;
}

export interface ProtectOptions {
    required?: boolean;
    roles?: string[];
}

export class AuthManager {
    private jwtAdapter: JWTAdapter;
    private googleAdapter?: GoogleAdapter;

    constructor(opts: AuthOptions) {
        if (!opts.jwtSecret) {
            throw new AdapterError("jwtSecret required in AuthOptions");
        }

        if (opts.jwtSecret.length < 32) {
            logger.warn(" JWT secret is less than 32 characters - consider using a stronger secret");
        }

        logger.info("AuthManager initialized");

        this.jwtAdapter = new JWTAdapter({
            secret: opts.jwtSecret,
            expiresIn: opts.jwtExpiresIn ?? "1d",
        });

        if (opts.googleClientId) {
            this.googleAdapter = new GoogleAdapter(opts.googleClientId);
            logger.info("GoogleAdapter enabled");
        }
    }

    sign(payload: object, options?: { expiresIn?: string | number, jti?: string }) {
        logger.info("JWT Sign called");
        return this.jwtAdapter.sign(payload, options);
    }

    verify(token: string) {
        logger.info("JWT Verify called");
        return this.jwtAdapter.verify(token);
    }

    async verifyGoogleIdToken(idToken: string) {
        if (!this.googleAdapter) {
            throw new AdapterError("GoogleAdapter not configured.");
        }

        logger.info("Google ID Token verify called");

        try {
            return await this.googleAdapter.verifyIdToken(idToken);
        } catch (err: any) {
            logger.error("Google ID Token verification failed", { error: err?.message });
            throw HttpError.Unauthorized("Invalid Google ID token");
        }
    }

    protect(options?: ProtectOptions) {
        const required = options?.required ?? true;
        const roles = options?.roles;

        return (req: Request, res: Response, next: NextFunction) => {
            const header = req.headers["authorization"];

            
            if (!required && !header) {
                return next();
            }

           
            if (!header) {
                logger.warn("Missing Authorization header", {
                    path: req.path,
                    method: req.method
                });
                return next(HttpError.Unauthorized("Missing Authorization header"));
            }

          
            const [type, token] = String(header).split(" ");
            if (type !== "Bearer" || !token) {
                logger.warn("Invalid Authorization header", {
                    path: req.path,
                    method: req.method
                });
                return next(HttpError.Unauthorized("Invalid Authorization header"));
            }

            try {

                // Verify JWT
                const decoded = this.verify(token);
                
                // Attach to request
                (req as any).auth = decoded;
                (req as any).user = decoded; 
                
                // Role-based authorization - role added Middleware
                if (roles && roles.length > 0) {
                    const userRole = (decoded as any).role || (decoded as any).roles?.[0];
                    if (!userRole || !roles.includes(userRole)) {
                        logger.warn("Insufficient permissions", {
                            path: req.path,
                            requiredRoles: roles,
                            userRole
                        });
                        return next(HttpError.Forbidden("Insufficient permissions"));
                    }
                }
                
                return next();
            } catch (err: any) {
                logger.error("JWT verify failed", {
                    error: err?.message,
                    path: req.path,
                    method: req.method
                });
                return next(HttpError.Unauthorized("Invalid or expired token"));
            }
        };
    }
}