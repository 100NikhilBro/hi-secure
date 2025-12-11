// // import { OAuth2Client, LoginTicket } from "google-auth-library";
// // import { AdapterError } from "../core/errors/AdapterError";
// // import { logWarn, logError } from "../logging";

// // export class GoogleAdapter {
// //     private client: OAuth2Client;
// //     private clientId?: string;

// //     constructor(clientId?: string) {
// //         this.client = new OAuth2Client(clientId);
// //         this.clientId = clientId as any;
// //     }

// //     async verifyIdToken(idToken: string) {
// //         try {
// //             const options: {
// //                 idToken: string;
// //                 audience?: string | string[];
// //             } = { idToken };

// //             // ADD ONLY IF DEFINED → FIXES TS ERROR
// //             if (this.clientId !== undefined) {
// //                 options.audience = this.clientId;
// //             }

// //             const ticket: LoginTicket = await this.client.verifyIdToken(options);

// //             const payload = ticket.getPayload();
// //             if (!payload) {
// //                 logWarn("GoogleAdapter: Empty payload");
// //                 throw new AdapterError("Invalid Google ID token payload.");
// //             }

// //             return {
// //                 sub: payload.sub,
// //                 email: payload.email,
// //                 email_verified: payload.email_verified,
// //                 name: payload.name,
// //                 picture: payload.picture,
// //             };

// //         } catch (err: any) {
// //             logError("GoogleAdapter.verifyIdToken failed", { error: err?.message });
// //             throw new AdapterError(err?.message || "Google token verification failed");
// //         }
// //     }
// // }




// // src/adapters/GoogleAdapter.ts - IMPROVED
// import { OAuth2Client, LoginTicket } from "google-auth-library";
// import { AdapterError } from "../core/errors/AdapterError.js";
// import { logWarn, logError } from "../logging/index.js";

// export interface GoogleTokenPayload {
//     sub: string;
//     email: string;
//     email_verified: boolean;
//     name?: string;
//     picture?: string;
//     [key: string]: any;
// }

// export class GoogleAdapter {
//     private client: OAuth2Client;
//     private clientId?: string;

//     constructor(clientId?: string) {
//         if (clientId && clientId.trim().length === 0) {
//             throw new AdapterError("Google clientId cannot be empty string");
//         }
        
//         this.client = new OAuth2Client(clientId);
//         this.clientId = clientId;
//     }

//     async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
//         try {
//             if (!idToken || typeof idToken !== 'string') {
//                 throw new AdapterError("Invalid ID token provided");
//             }

//             const options: { idToken: string; audience?: string | string[] } = { 
//                 idToken 
//             };

//             // Add audience only if clientId is provided and not empty
//             if (this.clientId && this.clientId.trim().length > 0) {
//                 options.audience = this.clientId;
//             }

//             const ticket: LoginTicket = await this.client.verifyIdToken(options);
//             const payload = ticket.getPayload();
            
//             if (!payload) {
//                 logWarn("GoogleAdapter: Empty payload");
//                 throw new AdapterError("Invalid Google ID token payload.");
//             }

//             return {
//                 sub: payload.sub,
//                 email: payload.email || '',
//                 email_verified: payload.email_verified || false,
//                 name: payload.name,
//                 picture: payload.picture,
//                 ...payload
//             };

//         } catch (err: any) {
//             logError("GoogleAdapter.verifyIdToken failed", { 
//                 error: err?.message,
//                 hasClientId: !!this.clientId 
//             });
            
//             if (err.message?.includes('audience')) {
//                 throw new AdapterError("Invalid Google client ID configured.");
//             }
            
//             throw new AdapterError(err?.message || "Google token verification failed");
//         }
//     }
// }



// src/adapters/GoogleAdapter.ts - FIXED
import { OAuth2Client, LoginTicket } from "google-auth-library";
import { AdapterError } from "../core/errors/AdapterError.js";
// import { logWarn, logError } from "../logging/index.js";

import {logger} from '../logging';

export interface GoogleTokenPayload {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
    [key: string]: any;
}

export class GoogleAdapter {
    private client: OAuth2Client;
    private clientId?: string;

    constructor(clientId?: string) {
        if (clientId && clientId.trim().length === 0) {
            throw new AdapterError("Google clientId cannot be empty string");
        }
        
        this.client = new OAuth2Client(clientId);
        this.clientId = clientId;
    }

    async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
        try {
            if (!idToken || typeof idToken !== 'string') {
                throw new AdapterError("Invalid ID token provided");
            }

            const options: { idToken: string; audience?: string | string[] } = { 
                idToken 
            };

            // Add audience only if clientId is provided and not empty
            if (this.clientId && this.clientId.trim().length > 0) {
                options.audience = this.clientId;
            }

            const ticket: LoginTicket = await this.client.verifyIdToken(options);
            const payload = ticket.getPayload();
            
            if (!payload) {
                logger.warn("GoogleAdapter: Empty payload");
                throw new AdapterError("Invalid Google ID token payload.");
            }

            // Create result object
            const result: GoogleTokenPayload = {
                sub: payload.sub,
                email: payload.email || '',
                email_verified: payload.email_verified || false,
                name: payload.name,
                picture: payload.picture
            };

            // Add remaining properties from payload (excluding duplicates)
            const { sub, email, email_verified, name, picture, ...rest } = payload;
            Object.assign(result, rest);

            return result;

        } catch (err: any) {
            logger.error("GoogleAdapter.verifyIdToken failed", { 
                error: err?.message,
                hasClientId: !!this.clientId 
            });
            
            if (err.message?.includes('audience')) {
                throw new AdapterError("Invalid Google client ID configured.");
            }
            
            throw new AdapterError(err?.message || "Google token verification failed");
        }
    }
}