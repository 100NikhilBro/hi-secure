// import { AdapterError } from "../core/errors/AdapterError";
// import { HiSecureConfig } from "../core/config";
// import { logger } from "../logging";

// export class HashManager {
//     private config: HiSecureConfig["hashing"];
//     private primaryAdapter: {
//         hash: (value: string) => Promise<string>;
//         verify: (value: string, hashed: string) => Promise<boolean>;
//     };
//     private fallbackAdapter: {
//         hash: (value: string) => Promise<string>;
//         verify: (value: string, hashed: string) => Promise<boolean>;
//     } | null;

//     constructor(
//         config: HiSecureConfig["hashing"],
//         primaryAdapter: any,
//         fallbackAdapter: any
//     ) {
//         this.config = config;
//         this.primaryAdapter = primaryAdapter;
//         this.fallbackAdapter = fallbackAdapter;
//     }

//     /**
//      * Hash a password using primary adapter (Argon2)
//      * If it fails → fallback (Bcrypt)
//      */
//     async hash(value: string): Promise<string> {
//         try {
//             return await this.primaryAdapter.hash(value);
//         } catch (err: any) {
//             logger.warn("⚠ Primary hashing failed — switching to fallback", {
//                 error: err?.message,
//             });

//             if (!this.fallbackAdapter) {
//                 throw new AdapterError(
//                     "Primary hashing failed and no fallback adapter is configured."
//                 );
//             }

//             try {
//                 return await this.fallbackAdapter.hash(value);
//             } catch (fallbackErr: any) {
//                 logger.error("❌ Fallback hashing failed", {
//                     error: fallbackErr?.message,
//                 });
//                 throw new AdapterError(
//                     "Both primary and fallback hashing failed."
//                 );
//             }
//         }
//     }

//     /**
//      * Verify using primary hashing method.
//      * If mismatch OR failure → use fallback.
//      */
//     async verify(value: string, hashed: string): Promise<boolean> {
//         try {
//             return await this.primaryAdapter.verify(value, hashed);
//         } catch (err: any) {
//             logger.warn("⚠ Primary verify failed — trying fallback", {
//                 error: err?.message,
//             });

//             if (!this.fallbackAdapter) {
//                 throw new AdapterError(
//                     "Primary verify failed and no fallback adapter is configured."
//                 );
//             }

//             try {
//                 return await this.fallbackAdapter.verify(value, hashed);
//             } catch (fallbackErr: any) {
//                 logger.error("❌ Fallback verify failed", {
//                     error: fallbackErr?.message,
//                 });

//                 throw new AdapterError(
//                     "Both primary and fallback verify failed."
//                 );
//             }
//         }
//     }
// }







import { AdapterError } from "../core/errors/AdapterError";
import { HiSecureConfig } from "../core/config";
import { logger } from "../logging";

interface HashAdapter {
    hash(value: string): Promise<string>;
    verify(value: string, hashed: string): Promise<boolean>;
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
    }

    async hash(value: string): Promise<string> {
        try {
            return await this.primaryAdapter.hash(value);
        } catch (err: any) {
            logger.warn("⚠ Primary hashing failed — trying fallback", {
                error: err?.message,
            });

            if (!this.fallbackAdapter) {
                throw new AdapterError(
                    "Primary hashing failed and no fallback adapter configured."
                );
            }

            try {
                return await this.fallbackAdapter.hash(value);
            } catch (fallbackErr: any) {
                logger.error("❌ Fallback hashing failed", {
                    error: fallbackErr?.message,
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
        } catch (err: any) {
            logger.warn("⚠ Primary verify failed — trying fallback", {
                error: err?.message,
            });

            if (!this.fallbackAdapter) {
                throw new AdapterError(
                    "Primary verify failed and no fallback adapter configured."
                );
            }

            try {
                return await this.fallbackAdapter.verify(value, hashed);
            } catch (fallbackErr: any) {
                logger.error("❌ Fallback verify failed", {
                    error: fallbackErr?.message,
                });
                throw new AdapterError(
                    "Both primary and fallback verify failed."
                );
            }
        }
    }
}
