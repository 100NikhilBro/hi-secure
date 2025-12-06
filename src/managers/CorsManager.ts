import cors from "cors";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError";

export class CorsManager {

    middleware(options?: any) {
        try {
            // options = undefined → use default CORS
            return options ? cors(options) : cors();

        } catch (err: any) {
            logger.error("❌ CORS Manager: failed to create CORS middleware", {
                error: err?.message || err,
                options
            });
            throw new AdapterError("CORS middleware initialization failed.");
        }
    }
}
