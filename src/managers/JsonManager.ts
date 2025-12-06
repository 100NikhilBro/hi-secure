import express from "express";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError";

export class JsonManager {

    /**
     * JSON parser middleware — global + dynamic override
     */
    middleware(options?: any) {
        try {
            const opts = options || {};
            return express.json(opts);
        } catch (err: any) {
            logger.error("❌ JSON Manager: failed to create JSON parser", {
                error: err?.message || err
            });
            throw new AdapterError("JSON parser initialization failed.");
        }
    }

    /**
     * URL-encoded parser — same global + dynamic style
     */
    urlencoded(options?: any) {
        try {
            const opts = options || { extended: true };
            return express.urlencoded(opts);
        } catch (err: any) {
            logger.error("❌ JSON Manager: failed to create urlencoded parser", {
                error: err?.message || err
            });
            throw new AdapterError("URL-encoded parser initialization failed.");
        }
    }
}
