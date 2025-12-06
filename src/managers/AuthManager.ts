import { JWTAdapter } from "../adapters/JWTAdapter";
import { GoogleAdapter } from "../adapters/GoggleAdapter";
import { AdapterError } from "../core/errors/AdapterError";
import { HttpError } from "../core/errors/HttpErrror";
import { Request, Response, NextFunction } from "express";
import { logError, logWarn, logInfo } from "../logging";

export interface AuthOptions {
    jwtSecret: string;
    jwtExpiresIn?: string | number | undefined;
    googleClientId?: string | undefined;
}

export class AuthManager {
    private jwtAdapter: JWTAdapter;
    private googleAdapter?: GoogleAdapter;

    constructor(opts: AuthOptions) {
        if (!opts.jwtSecret)
            throw new AdapterError("jwtSecret required in AuthOptions");

        logInfo("AuthManager initialized");

        this.jwtAdapter = new JWTAdapter({
            secret: opts.jwtSecret,
            expiresIn: opts.jwtExpiresIn ?? undefined,
        });

        if (opts.googleClientId) {
            this.googleAdapter = new GoogleAdapter(opts.googleClientId);
            logInfo("GoogleAdapter enabled");
        }
    }

    sign(payload: object, options?: { expiresIn?: string | number }) {
        logInfo("JWT Sign called");
        return this.jwtAdapter.sign(payload, options);
    }

    verify(token: string) {
        logInfo("JWT Verify called");
        return this.jwtAdapter.verify(token);
    }

    async verifyGoogleIdToken(idToken: string) {
        if (!this.googleAdapter)
            throw new AdapterError("GoogleAdapter not configured.");

        logInfo("Google ID Token verify called");

        try {
            return await this.googleAdapter.verifyIdToken(idToken);
        } catch (err: any) {
            logError("Google ID Token verification failed", { error: err?.message });
            throw HttpError.Unauthorized("Invalid Google ID token");
        }
    }

    protect(options?: { required?: boolean }) {
        const required = options?.required ?? true;

        return (req: Request, res: Response, next: NextFunction) => {
            const header = req.headers["authorization"] || req.headers["Authorization"];

            if (!header) {
                if (required) {
                    logWarn("Missing Authorization header", {
                        path: req.path,
                        method: req.method
                    });
                    return next(HttpError.Unauthorized("Missing Authorization header"));
                }
                return next();
            }

            const [type, token] = String(header).split(" ");

            if (type !== "Bearer" || !token) {
                logWarn("Invalid Authorization header", {
                    path: req.path,
                    method: req.method
                });
                return next(HttpError.Unauthorized("Invalid Authorization header"));
            }

            try {
                const decoded = this.verify(token);
                (req as any).auth = decoded;
                return next();
            } catch (err: any) {
                logError("JWT verify failed", {
                    error: err?.message,
                    path: req.path,
                    method: req.method
                });
                return next(HttpError.Unauthorized("Invalid or expired token"));
            }
        };
    }
}
