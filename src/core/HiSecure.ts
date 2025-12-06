// // import { defaultConfig, HiSecureConfig } from "./config";
// // import { LIB_NAME, LIB_VERSION } from "./constants";
// // import { deepMerge } from "../utils/deepMerge";
// // import { deepFreeze } from "../utils/deepFreeze";

// // // Logging
// // import { logger } from "../logging";

// // // Adapters
// // import { ArgonAdapter } from "../adapters/ArgonAdapter";
// // import { BcryptAdapter } from "../adapters/BcryptAdapter";
// // import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter";
// // import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter";
// // import { ZodAdapter } from "../adapters/ZodAdapter";
// // import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter";
// // import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter";
// // import { DomPurifyAdapter } from "../adapters/DomPurifyAdapter";

// // // Managers
// // import { HashManager } from "../managers/HashManager";
// // import { RateLimitManager } from "../managers/RateLimitManager";
// // import { ValidatorManager } from "../managers/ValidatorManager";
// // import { SanitizerManager } from "../managers/SanitizerManager";
// // import { JsonManager } from "../managers/JsonManager";
// // import { CorsManager } from "../managers/CorsManager";

// // // Middlewares
// // import helmet from "helmet";
// // import hpp from "hpp";
// // import cors from "cors";
// // import express from "express";

// // // Error Handler
// // import { errorHandler } from "../middlewares/errorHandler";

// // export class HiSecure {
// //     private config: HiSecureConfig;
// //     private initialized = false;

// //     // Managers
// //     public hashManager!: HashManager;
// //     public rateLimitManager!: RateLimitManager;
// //     public validatorManager!: ValidatorManager;
// //     public sanitizerManager!: SanitizerManager;

// //     // Dynamic managers
// //     public jsonManager!: JsonManager;
// //     public corsManager!: CorsManager;

// //     // Adapters
// //     private hashingPrimary: any;
// //     private hashingFallback: any;
// //     private rateLimiterPrimary: any;
// //     private rateLimiterFallback: any;
// //     private validatorPrimary: any;
// //     private validatorFallback: any;
// //     private sanitizerPrimary: any;
// //     private sanitizerFallback: any;

// //     constructor(userConfig: Partial<HiSecureConfig> = {}) {
// //         this.config = deepMerge(defaultConfig, userConfig);
// //     }

// //     init() {
// //         if (this.initialized) {
// //             logger.warn("⚠ HiSecure.init() called again → ignored.");
// //             return;
// //         }

// //         logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initialized`);
// //         logger.info("⚙️ Loaded configuration:", this.config);

// //         this.setupAdapters();
// //         this.setupManagers();
// //         this.setupDynamicManagers();

// //         // Deep freeze all internal structures
// //         deepFreeze(this.config);
// //         deepFreeze(this.hashManager);
// //         deepFreeze(this.rateLimitManager);
// //         deepFreeze(this.validatorManager);
// //         deepFreeze(this.sanitizerManager);
// //         deepFreeze(this.jsonManager);
// //         deepFreeze(this.corsManager);

// //         this.initialized = true;
// //         logger.info("🔒 HiSecure fully locked — Ready for production");
// //     }

// //     isInitialized() {
// //         return this.initialized;
// //     }

// //     // ------------------------------------------------
// //     // Adapter Setup
// //     // ------------------------------------------------
// //     private setupAdapters() {
// //         logger.info("🧩 Setting up adapters...");

// //         // Hashing
// //         this.hashingPrimary =
// //             this.config.hashing.primary === "argon2"
// //                 ? new ArgonAdapter()
// //                 : new BcryptAdapter(this.config.hashing.saltRounds);

// //         this.hashingFallback =
// //             this.config.hashing.fallback === "bcrypt"
// //                 ? new BcryptAdapter(this.config.hashing.saltRounds)
// //                 : null;

// //         // Rate Limiter
// //         this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
// //         ? new RLFlexibleAdapter()
// //         : new ExpressRLAdapter()

// //         this.rateLimiterFallback = new ExpressRLAdapter();


// //         // Validators
// //         this.validatorPrimary =
// //             this.config.validation.mode === "zod"
// //                 ? new ZodAdapter()
// //                 : new ExpressValidatorAdapter();

// //         this.validatorFallback =
// //             this.config.validation.fallback === "express-validator"
// //                 ? new ExpressValidatorAdapter()
// //                 : null;

// //         // Sanitizers
// //         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
// //         this.sanitizerFallback = new DomPurifyAdapter();

// //         logger.info("✔ Adapters ready");
// //     }

// //     // ------------------------------------------------
// //     // Core Managers
// //     // ------------------------------------------------
// //     private setupManagers() {
// //         logger.info("🗂 Setting up managers...");

// //         this.hashManager = new HashManager(
// //             this.config.hashing,
// //             this.hashingPrimary,
// //             this.hashingFallback
// //         );

// //         this.rateLimitManager = new RateLimitManager(
// //             this.config.rateLimiter,
// //             this.rateLimiterPrimary,
// //             this.rateLimiterFallback
// //         );

// //         this.validatorManager = new ValidatorManager(
// //             this.config.validation,
// //             this.validatorPrimary,
// //             this.validatorFallback
// //         );

// //         this.sanitizerManager = new SanitizerManager(
// //             this.sanitizerPrimary,
// //             this.sanitizerFallback
// //         );

// //         logger.info("✔ Managers ready");
// //     }

// //     // ------------------------------------------------
// //     // Dynamic Managers (JSON, CORS)
// //     // ------------------------------------------------
// //     private setupDynamicManagers() {
// //         logger.info("🧰 Setting up dynamic managers...");
// //         this.jsonManager = new JsonManager();
// //         this.corsManager = new CorsManager();
// //         logger.info("✔ Dynamic managers ready");
// //     }

// //     // ------------------------------------------------
// //     // PUBLIC API
// //     // ------------------------------------------------
// //     hash(value: string) {
// //         return this.hashManager.hash(value);
// //     }

// //     verify(value: string, hashed: string) {
// //         return this.hashManager.verify(value, hashed);
// //     }

// //     sanitize(value: string) {
// //         return this.sanitizerManager.sanitize(value);
// //     }

// //     validate(schema: any) {
// //         return this.validatorManager.validate(schema);
// //     }

// //     // ------------------------------------------------
// //     // GLOBAL MIDDLEWARE PIPELINE
// //     // ------------------------------------------------
// //     middleware() {
// //         const chain: any[] = [];

// //         chain.push(express.json());
// //         chain.push(express.urlencoded({ extended: true }));

// //         if (this.config.enableHelmet) chain.push(helmet());
// //         if (this.config.enableHPP) chain.push(hpp());
// //         if (this.config.enableCORS) chain.push(cors());

// //         if (this.config.enableSanitizer)
// //             chain.push(this.sanitizerManager.middleware());

// //         if (this.config.enableRateLimiter)
// //             chain.push(this.rateLimitManager.middleware());

// //         chain.push(errorHandler);

// //         return chain;
// //     }
// // }




// import { defaultConfig, HiSecureConfig } from "./config";
// import { LIB_NAME, LIB_VERSION } from "./constants";
// import { deepMerge } from "../utils/deepMerge";
// import { deepFreeze } from "../utils/deepFreeze";

// import { logger } from "../logging";

// // Adapters
// import { ArgonAdapter } from "../adapters/ArgonAdapter";
// import { BcryptAdapter } from "../adapters/BcryptAdapter";
// import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter";
// import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter";
// import { ZodAdapter } from "../adapters/ZodAdapter";
// import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter";
// import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter";
// import { DomPurifyAdapter } from "../adapters/DomPurifyAdapter";

// // Managers
// import { HashManager } from "../managers/HashManager";
// import { RateLimitManager } from "../managers/RateLimitManager";
// import { ValidatorManager } from "../managers/ValidatorManager";
// import { SanitizerManager } from "../managers/SanitizerManager";
// import { JsonManager } from "../managers/JsonManager";
// import { CorsManager } from "../managers/CorsManager";

// // 3rd-party express middlewares
// import helmet from "helmet";
// import hpp from "hpp";

// // Error handler
// import { errorHandler } from "../middlewares/errorHandler";

// export class HiSecure {
//     private config: HiSecureConfig;
//     private initialized = false;

//     // Managers
//     public hashManager!: HashManager;
//     public rateLimitManager!: RateLimitManager;
//     public validatorManager!: ValidatorManager;
//     public sanitizerManager!: SanitizerManager;

//     public jsonManager!: JsonManager;
//     public corsManager!: CorsManager;

//     // Adapters
//     private hashingPrimary: any;
//     private hashingFallback: any;
//     private rateLimiterPrimary: any;
//     private rateLimiterFallback: any;
//     private validatorPrimary: any;
//     private validatorFallback: any;
//     private sanitizerPrimary: any;
//     private sanitizerFallback: any;

//     constructor(userConfig: Partial<HiSecureConfig> = {}) {
//         this.config = deepMerge(defaultConfig, userConfig);
//     }

//     init() {
//         if (this.initialized) {
//             logger.warn("⚠ HiSecure.init() called twice → ignored.");
//             return;
//         }

//         logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initialized`);
//         logger.info("⚙ Loaded configuration:", this.config);

//         this.setupAdapters();
//         this.setupManagers();
//         this.setupDynamicManagers();

//         deepFreeze(this.config);
//         deepFreeze(this.hashManager);
//         deepFreeze(this.rateLimitManager);
//         deepFreeze(this.validatorManager);
//         deepFreeze(this.sanitizerManager);
//         deepFreeze(this.jsonManager);
//         deepFreeze(this.corsManager);

//         this.initialized = true;

//         logger.info("🔒 HiSecure locked — production-ready");
//     }

//     isInitialized() {
//         return this.initialized;
//     }

//     // ------------------------------------------------------------------
//     // ADAPTER SETUP
//     // ------------------------------------------------------------------
//     private setupAdapters() {
//         logger.info("🧩 Setting up adapters...");

//         this.hashingPrimary =
//             this.config.hashing.primary === "argon2"
//                 ? new ArgonAdapter()
//                 : new BcryptAdapter(this.config.hashing.saltRounds);

//         this.hashingFallback =
//             this.config.hashing.fallback === "bcrypt"
//                 ? new BcryptAdapter(this.config.hashing.saltRounds)
//                 : null;

//         this.rateLimiterPrimary =
//             this.config.rateLimiter.useAdaptiveMode
//                 ? new RLFlexibleAdapter()
//                 : new ExpressRLAdapter();

//         this.rateLimiterFallback = new ExpressRLAdapter();

//         this.validatorPrimary =
//             this.config.validation.mode === "zod"
//                 ? new ZodAdapter()
//                 : new ExpressValidatorAdapter();

//         this.validatorFallback =
//             this.config.validation.fallback === "express-validator"
//                 ? new ExpressValidatorAdapter()
//                 : null;

//         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
//         this.sanitizerFallback = new DomPurifyAdapter();

//         logger.info("✔ Adapters ready");
//     }

//     // ------------------------------------------------------------------
//     // MANAGER SETUP
//     // ------------------------------------------------------------------
//     private setupManagers() {

//         this.hashManager = new HashManager(
//             this.config.hashing,
//             this.hashingPrimary,
//             this.hashingFallback
//         );

//         this.rateLimitManager = new RateLimitManager(
//             this.config.rateLimiter,
//             this.rateLimiterPrimary,
//             this.rateLimiterFallback
//         );

//         this.validatorManager = new ValidatorManager(
//             this.config.validation,
//             this.validatorPrimary,
//             this.validatorFallback
//         );

//         this.sanitizerManager = new SanitizerManager(
//             this.sanitizerPrimary,
//             this.sanitizerFallback
//         );
//     }

//     private setupDynamicManagers() {
//         this.jsonManager = new JsonManager();
//         this.corsManager = new CorsManager();
//     }

//     // ------------------------------------------------------------------
//     // PUBLIC API
//     // ------------------------------------------------------------------
//     hash(v: string) { return this.hashManager.hash(v); }
//     verify(v: string, h: string) { return this.hashManager.verify(v, h); }
//     sanitize(v: string) { return this.sanitizerManager.sanitize(v); }
//     validate(schema: any) { return this.validatorManager.validate(schema); }

//     // ------------------------------------------------------------------
//     // GLOBAL MIDDLEWARE PIPELINE
//     // ------------------------------------------------------------------
//     middleware() {
//         const chain: any[] = [];

//         chain.push(this.jsonManager.middleware(this.config.json));
//         chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

//         if (this.config.enableHelmet) chain.push(helmet());
//         if (this.config.enableHPP) chain.push(hpp());

//         if (this.config.enableCORS)
//             chain.push(this.corsManager.middleware(this.config.cors));

//         if (this.config.enableSanitizer)
//             chain.push(this.sanitizerManager.middleware());

//         if (this.config.enableRateLimiter)
//             chain.push(this.rateLimitManager.middleware());

//         chain.push(errorHandler);

//         return chain;
//     }
// }







// src/core/HiSecure.ts

import { defaultConfig, HiSecureConfig } from "./config";
import { LIB_NAME, LIB_VERSION } from "./constants";
import { deepMerge } from "../utils/deepMerge";
import { deepFreeze } from "../utils/deepFreeze";

import { logger } from "../logging";

// Adapters
import { ArgonAdapter } from "../adapters/ArgonAdapter";
import { BcryptAdapter } from "../adapters/BcryptAdapter";
import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter";
import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter";
import { ZodAdapter } from "../adapters/ZodAdapter";
import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter";
import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter";
import { DomPurifyAdapter } from "../adapters/DomPurifyAdapter";

// Managers
import { HashManager } from "../managers/HashManager";
import { RateLimitManager } from "../managers/RateLimitManager";
import { ValidatorManager } from "../managers/ValidatorManager";
import { SanitizerManager } from "../managers/SanitizerManager";
import { JsonManager } from "../managers/JsonManager";
import { CorsManager } from "../managers/CorsManager";
import { AuthManager } from "../managers/AuthManager";

// 3rd-party express middlewares
import helmet from "helmet";
import hpp from "hpp";

// Shared error handler
import { errorHandler } from "../middlewares/errorHandler";

export class HiSecure {
    private config: HiSecureConfig;
    private initialized = false;

    // Managers exposed for user
    public hashManager!: HashManager;
    public rateLimitManager!: RateLimitManager;
    public validatorManager!: ValidatorManager;
    public sanitizerManager!: SanitizerManager;
    public jsonManager!: JsonManager;
    public corsManager!: CorsManager;
    public authManager?: AuthManager;

    // Internal adapters
    private hashingPrimary: any;
    private hashingFallback: any;
    private rateLimiterPrimary: any;
    private rateLimiterFallback: any;
    private validatorPrimary: any;
    private validatorFallback: any;
    private sanitizerPrimary: any;
    private sanitizerFallback: any;

    constructor(userConfig: Partial<HiSecureConfig> = {}) {
        this.config = deepMerge(defaultConfig, userConfig);
    }

    // ---------------------------------------------------------
    // INIT
    // ---------------------------------------------------------
    init() {
        if (this.initialized) {
            logger.warn("⚠ HiSecure.init() called twice → ignored.");
            return;
        }

        logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initialized`);
        logger.info("⚙ Loaded configuration:", this.config);

        this.setupAdapters();
        this.setupManagers();
        this.setupDynamicManagers();

        // IMMUTABLE — library cannot be modified at runtime
        deepFreeze(this.config);
        deepFreeze(this.hashManager);
        deepFreeze(this.rateLimitManager);
        deepFreeze(this.validatorManager);
        deepFreeze(this.sanitizerManager);
        deepFreeze(this.jsonManager);
        deepFreeze(this.corsManager);
        if (this.authManager) deepFreeze(this.authManager);

        this.initialized = true;

        logger.info("🔒 HiSecure locked — production-ready");
    }

    isInitialized() {
        return this.initialized;
    }

    // ---------------------------------------------------------
    // ADAPTER SETUP
    // ---------------------------------------------------------
    private setupAdapters() {
        logger.info("🧩 Setting up adapters...");

        // Hashing
        this.hashingPrimary =
            this.config.hashing.primary === "argon2"
                ? new ArgonAdapter()
                : new BcryptAdapter(this.config.hashing.saltRounds);

        this.hashingFallback =
            this.config.hashing.fallback === "bcrypt"
                ? new BcryptAdapter(this.config.hashing.saltRounds)
                : null;

        // Rate limiter
        this.rateLimiterPrimary =
            this.config.rateLimiter.useAdaptiveMode
                ? new RLFlexibleAdapter()
                : new ExpressRLAdapter();

        this.rateLimiterFallback = new ExpressRLAdapter();

        // Validator
        this.validatorPrimary =
            this.config.validation.mode === "zod"
                ? new ZodAdapter()
                : new ExpressValidatorAdapter();

        this.validatorFallback =
            this.config.validation.fallback === "express-validator"
                ? new ExpressValidatorAdapter()
                : null;

        // Sanitizer
        this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
        this.sanitizerFallback = new DomPurifyAdapter();

        logger.info("✔ Adapters ready");
    }

    // ---------------------------------------------------------
    // MANAGER SETUP
    // ---------------------------------------------------------
    private setupManagers() {
        this.hashManager = new HashManager(
            this.config.hashing,
            this.hashingPrimary,
            this.hashingFallback
        );

        this.rateLimitManager = new RateLimitManager(
            this.config.rateLimiter,
            this.rateLimiterPrimary,
            this.rateLimiterFallback
        );

        this.validatorManager = new ValidatorManager(
            this.config.validation,
            this.validatorPrimary,
            this.validatorFallback
        );

        this.sanitizerManager = new SanitizerManager(
            this.sanitizerPrimary,
            this.sanitizerFallback
        );
    }

    // ---------------------------------------------------------
    // DYNAMIC MANAGERS (JSON, CORS, AUTH)
    // ---------------------------------------------------------
    private setupDynamicManagers() {
        this.jsonManager = new JsonManager();
        this.corsManager = new CorsManager();

        // AUTH SUPPORT
        if (this.config.auth?.enabled) {
            this.authManager = new AuthManager({
                jwtSecret: process.env.JWT_SECRET!,
                jwtExpiresIn: this.config.auth.jwtExpiresIn,
                googleClientId: process.env.GOOGLE_CLIENT_ID
            });
        }
    }

    // ---------------------------------------------------------
    // PUBLIC API METHODS
    // ---------------------------------------------------------
    hash(value: string) {
        return this.hashManager.hash(value);
    }

    verify(value: string, hashed: string) {
        return this.hashManager.verify(value, hashed);
    }

    sanitize(value: string) {
        return this.sanitizerManager.sanitize(value);
    }

    validate(schema: any) {
        return this.validatorManager.validate(schema);
    }

    // ---------------------------------------------------------
    // EXPRESS GLOBAL PIPELINE
    // ---------------------------------------------------------
    middleware() {
        const chain: any[] = [];

        // JSON + URL encoded
        chain.push(this.jsonManager.middleware(this.config.json));
        chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

        // Core security
        if (this.config.enableHelmet) chain.push(helmet());
        if (this.config.enableHPP) chain.push(hpp());

        if (this.config.enableCORS)
            chain.push(this.corsManager.middleware(this.config.cors));

        if (this.config.enableSanitizer)
            chain.push(this.sanitizerManager.middleware());

        if (this.config.enableRateLimiter)
            chain.push(this.rateLimitManager.middleware());

        // Centralized error handling
        chain.push(errorHandler);

        return chain;
    }
}
