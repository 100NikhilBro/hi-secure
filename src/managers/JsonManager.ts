import express from "express";
import qs from "qs";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError.js";

export class JsonManager {
    middleware(options?: any) {
        try {
            const defaultOptions = {
                limit: '1mb',
                inflate: true,
                strict: true
            };
            return express.json({ ...defaultOptions, ...(options || {}) });
        } catch (err: any) {
            logger.error("JSON Manager: failed to create JSON parser");
            throw new AdapterError("JSON parser initialization failed.");
        }
    }

    urlencoded(options?: any) {
        try {
            const defaultOptions = {
                extended: true,
                limit: '1mb',
                parameterLimit: 1000
            };
            const opts = { ...defaultOptions, ...(options || {}) };
            return express.urlencoded(opts);
        } catch (err: any) {
            logger.error("URL-encoded parser failed");
            throw new AdapterError("URL-encoded parser initialization failed.");
        }
    }

    queryParser(options?: any) {
        return (req: any, res: any, next: any) => {
            try {
                if (!req.parsedQuery && req.url.includes('?')) {
                    const queryString = req.url.split("?")[1] || "";
                    const parsed = qs.parse(queryString, {
                        depth: 5,
                        parameterLimit: 100,
                        ...options
                    });
                    
                    req.parsedQuery = parsed;
                    logger.debug(" Query parsed", {
                        keys: Object.keys(parsed)
                    });
                }
                next();
            } catch (err: any) {
                logger.error("Failed to parse query", { error: err?.message });
                next(new AdapterError("Query parsing failed."));
            }
        };
    }
}