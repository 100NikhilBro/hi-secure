import jwt from "jsonwebtoken";
import { AdapterError } from "../core/errors/AdapterError";
import { logError } from "../logging";

export interface JWTAdapterOptions {
    secret: string;
    expiresIn?: string | number | undefined;
}

export class JWTAdapter {
    private secret: string;
    private expiresIn?: string | number;

    constructor(options: JWTAdapterOptions) {
        if (!options.secret) {
            throw new AdapterError("JWT secret is required");
        }

        this.secret = options.secret;

        // Normalize expiresIn
        if (options.expiresIn !== undefined) {
            this.expiresIn = options.expiresIn as string | number;
        }
    }

    sign(
        payload: object,
        options?: { expiresIn?: string | number }
    ) {
        try {
            const finalExpires =
                options?.expiresIn ?? this.expiresIn;

            const jwtOptions: jwt.SignOptions = {};

            if (finalExpires !== undefined) {
                // Force safe cast → matches SignOptions type
                jwtOptions.expiresIn = finalExpires as number | any;
            }

            return jwt.sign(payload, this.secret, jwtOptions);

        } catch (err: any) {
            logError("JWTAdapter.sign failed", { error: err?.message });
            throw new AdapterError(err?.message || "JWT sign failed");
        }
    }

    verify(token: string) {
        try {
            return jwt.verify(token, this.secret);
        } catch (err: any) {
            logError("JWTAdapter.verify failed", { error: err?.message });
            throw new AdapterError(err?.message || "JWT verify failed");
        }
    }
}
