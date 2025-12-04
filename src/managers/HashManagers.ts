import { AdapterError } from "../core/errors/AdapterError";
import { HiSecureConfig } from "../core/config";
import { ADAPTERS } from "../core/constants";

export class HashManager {
    private config: HiSecureConfig["hashing"];
    private primaryAdapter: any;
    private fallbackAdapter: any;

    constructor(config: HiSecureConfig["hashing"], primaryAdapter: any, fallbackAdapter: any) {
        this.config = config;
        this.primaryAdapter = primaryAdapter;
        this.fallbackAdapter = fallbackAdapter;
    }

    /**
     * Hash a password using primary adapter (Argon2)
     * If it fails → use fallback (Bcrypt)
     */
    async hash(value: string): Promise<string> {
        try {
            return await this.primaryAdapter.hash(value);
        } catch (err) {
            console.warn(`⚠ Primary hashing failed. Using fallback adapter: ${ADAPTERS.HASHING_FALLBACK}`);

            if (!this.fallbackAdapter) {
                throw new AdapterError("Primary hashing failed and no fallback adapter configured.");
            }

            return await this.fallbackAdapter.hash(value);
        }
    }

    async verify(value: string, hashed: string): Promise<boolean> {
        try {
            return await this.primaryAdapter.verify(value, hashed);
        } catch (err) {
            console.warn("⚠ Primary verify failed → trying fallback adapter.");
            return await this.fallbackAdapter.verify(value, hashed);
        }
    }
}
