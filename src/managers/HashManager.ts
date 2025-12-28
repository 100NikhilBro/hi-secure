import { AdapterError } from "../core/errors/AdapterError";
import { HiSecureConfig } from "../core/types/HiSecureConfig";
import { logger } from "../logging";

interface HashAdapter {
    hash(value: string): Promise<string>;
    verify(value: string, hashed: string): Promise<boolean>;
}

export interface HashResult {
    hash: string;
    algorithm: string;
    usedFallback: boolean;
}

export class HashManager {
    private config: HiSecureConfig["hashing"];
    private primaryAdapter: HashAdapter;
    private fallbackAdapter: HashAdapter | null;

    constructor(
        config: HiSecureConfig["hashing"],
        primaryAdapter: HashAdapter,
        fallbackAdapter: HashAdapter | null
    ) {
        this.config = config;
        this.primaryAdapter = primaryAdapter;
        this.fallbackAdapter = fallbackAdapter;

        logger.info("HashManager initialized", {
            layer: "hash-manager",
            primary: config.primary,
            fallbackEnabled: !!fallbackAdapter
        });
    }

    async hash(
        value: string,
        options?: { allowFallback?: boolean }
    ): Promise<HashResult> {
        try {
            const hash = await this.primaryAdapter.hash(value);

            return {
                hash,
                algorithm: this.config.primary,
                usedFallback: false
            };

        } catch (err: any) {
            logger.warn("Primary hashing failed", {
                layer: "hash-manager",
                operation: "hash",
                algorithm: this.config.primary,
                reason: err?.message
            });

            if (!options?.allowFallback || !this.fallbackAdapter) {
                throw new AdapterError(
                    `Primary hashing (${this.config.primary}) failed. Fallback not allowed.`
                );
            }

            try {
                const hash = await this.fallbackAdapter.hash(value);

                // ⚠️ security downgrade log (VERY GOOD PRACTICE)
                logger.warn("Hashing fallback used (security downgrade)", {
                    layer: "hash-manager",
                    operation: "hash",
                    from: this.config.primary,
                    to: this.config.fallback
                });

                return {
                    hash,
                    algorithm: this.config.fallback || "bcrypt",
                    usedFallback: true
                };

            } catch (fallbackErr: any) {
                logger.error("Fallback hashing failed", {
                    layer: "hash-manager",
                    operation: "hash",
                    from: this.config.primary,
                    to: this.config.fallback,
                    reason: fallbackErr?.message
                });

                throw new AdapterError(
                    "Both primary and fallback hashing failed."
                );
            }
        }
    }

    async verify(value: string, hashed: string): Promise<boolean> {
        try {
            return await this.primaryAdapter.verify(value, hashed);

        } catch (primaryErr: any) {
            logger.warn("Primary hash verification failed", {
                layer: "hash-manager",
                operation: "verify",
                algorithm: this.config.primary,
                reason: primaryErr?.message
            });

            if (this.fallbackAdapter) {
                try {
                    return await this.fallbackAdapter.verify(value, hashed);

                } catch (fallbackErr: any) {
                    logger.error("Fallback hash verification failed", {
                        layer: "hash-manager",
                        operation: "verify",
                        from: this.config.primary,
                        to: this.config.fallback,
                        reason: fallbackErr?.message
                    });

                    throw new AdapterError(
                        "Both primary and fallback verify failed."
                    );
                }
            }

            throw new AdapterError(
                "Primary verify failed and no fallback adapter configured."
            );
        }
    }
}
