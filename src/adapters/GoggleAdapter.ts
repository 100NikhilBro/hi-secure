import { OAuth2Client, LoginTicket } from "google-auth-library";
import { AdapterError } from "../core/errors/AdapterError";
import { logWarn, logError } from "../logging";

export class GoogleAdapter {
    private client: OAuth2Client;
    private clientId?: string;

    constructor(clientId?: string) {
        this.client = new OAuth2Client(clientId);
        this.clientId = clientId as any;
    }

    async verifyIdToken(idToken: string) {
        try {
            const options: {
                idToken: string;
                audience?: string | string[];
            } = { idToken };

            // ADD ONLY IF DEFINED → FIXES TS ERROR
            if (this.clientId !== undefined) {
                options.audience = this.clientId;
            }

            const ticket: LoginTicket = await this.client.verifyIdToken(options);

            const payload = ticket.getPayload();
            if (!payload) {
                logWarn("GoogleAdapter: Empty payload");
                throw new AdapterError("Invalid Google ID token payload.");
            }

            return {
                sub: payload.sub,
                email: payload.email,
                email_verified: payload.email_verified,
                name: payload.name,
                picture: payload.picture,
            };

        } catch (err: any) {
            logError("GoogleAdapter.verifyIdToken failed", { error: err?.message });
            throw new AdapterError(err?.message || "Google token verification failed");
        }
    }
}
