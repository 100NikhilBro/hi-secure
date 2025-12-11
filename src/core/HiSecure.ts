// // // src/core/HiSecure.ts

// // import { HiSecureConfig } from "./types/HiSecureConfig.js";
// // import { defaultConfig } from "./config.js";
// // import { LIB_NAME, LIB_VERSION } from "./constants.js";
// // import { deepMerge } from "../utils/deepMerge.js";
// // import { deepFreeze } from "../utils/deepFreeze.js";

// // import { logger } from "../logging";

// // // Adapters
// // import { ArgonAdapter } from "../adapters/ArgonAdapter.js";
// // import { BcryptAdapter } from "../adapters/BcryptAdapter.js";
// // import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter.js";
// // import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter.js";
// // import { ZodAdapter } from "../adapters/ZodAdapter.js";
// // import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter.js";
// // import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter.js";
// // import { DomPurifyAdapter } from "../adapters/DomPurifyAdapter.js";

// // // Managers
// // import { HashManager } from "../managers/HashManager.js";
// // import { RateLimitManager } from "../managers/RateLimitManager.js";
// // import { ValidatorManager } from "../managers/ValidatorManager.js";
// // import { SanitizerManager } from "../managers/SanitizerManager.js";
// // import { JsonManager } from "../managers/JsonManager.js";
// // import { CorsManager } from "../managers/CorsManager.js";
// // import { AuthManager } from "../managers/AuthManager.js";

// // // 3rd-party express middlewares
// // import helmet from "helmet";
// // import hpp from "hpp";

// // // Shared error handler
// // import { errorHandler } from "../middlewares/errorHandler.js";

// // export class HiSecure {
// //     private config: HiSecureConfig;
// //     private initialized = false;

// //     // Managers exposed for user
// //     public hashManager!: HashManager;
// //     public rateLimitManager!: RateLimitManager;
// //     public validatorManager!: ValidatorManager;
// //     public sanitizerManager!: SanitizerManager;
// //     public jsonManager!: JsonManager;
// //     public corsManager!: CorsManager;
// //     public authManager?: AuthManager;

// //     // Internal adapters
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

// //     // ---------------------------------------------------------
// //     // INIT
// //     // ---------------------------------------------------------
// //     init() {
// //         if (this.initialized) {
// //             logger.warn("⚠ HiSecure.init() called twice → ignored.");
// //             return;
// //         }

// //         logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initialized`);
// //         logger.info("⚙ Loaded configuration:", this.config);

// //         this.setupAdapters();
// //         this.setupManagers();
// //         this.setupDynamicManagers();

// //         // IMMUTABLE — library cannot be modified at runtime
// //         deepFreeze(this.config);
// //         deepFreeze(this.hashManager);
// //         deepFreeze(this.rateLimitManager);
// //         deepFreeze(this.validatorManager);
// //         deepFreeze(this.sanitizerManager);
// //         deepFreeze(this.jsonManager);
// //         deepFreeze(this.corsManager);
// //         if (this.authManager) deepFreeze(this.authManager);

// //         this.initialized = true;

// //         logger.info("🔒 HiSecure locked — production-ready");
// //     }

// //     isInitialized() {
// //         return this.initialized;
// //     }

// //     // ---------------------------------------------------------
// //     // ADAPTER SETUP
// //     // ---------------------------------------------------------
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

// //         // Rate limiter
// //         this.rateLimiterPrimary =
// //             this.config.rateLimiter.useAdaptiveMode
// //                 ? new RLFlexibleAdapter()
// //                 : new ExpressRLAdapter();

// //         this.rateLimiterFallback = new ExpressRLAdapter();

// //         // Validator
// //         this.validatorPrimary =
// //             this.config.validation.mode === "zod"
// //                 ? new ZodAdapter()
// //                 : new ExpressValidatorAdapter();

// //         this.validatorFallback =
// //             this.config.validation.fallback === "express-validator"
// //                 ? new ExpressValidatorAdapter()
// //                 : null;

// //         // Sanitizer
// //         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
// //         this.sanitizerFallback = new DomPurifyAdapter();

// //         logger.info("✔ Adapters ready");
// //     }

// //     // ---------------------------------------------------------
// //     // MANAGER SETUP
// //     // ---------------------------------------------------------
// //     private setupManagers() {
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
// //     }

// //     // ---------------------------------------------------------
// //     // DYNAMIC MANAGERS (JSON, CORS, AUTH)
// //     // ---------------------------------------------------------
// //     private setupDynamicManagers() {
// //         this.jsonManager = new JsonManager();
// //         this.corsManager = new CorsManager();

// //         // AUTH SUPPORT
// //         if (this.config.auth?.enabled) {
// //             this.authManager = new AuthManager({
// //                 jwtSecret: process.env.JWT_SECRET!,
// //                 jwtExpiresIn: this.config.auth.jwtExpiresIn,
// //                 googleClientId: process.env.GOOGLE_CLIENT_ID
// //             });
// //         }
// //     }

// //     // ---------------------------------------------------------
// //     // PUBLIC API METHODS
// //     // ---------------------------------------------------------
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

// //     // ---------------------------------------------------------
// //     // EXPRESS GLOBAL PIPELINE
// //     // ---------------------------------------------------------
// //     middleware() {
// //         const chain: any[] = [];

// //         // JSON + URL encoded
// //         chain.push(this.jsonManager.middleware(this.config.json));
// //         chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

// //         // add qs
// //         chain.push(this.jsonManager.queryParser());

// //         // Core security
// //         if (this.config.enableHelmet) chain.push(helmet());
// //         if (this.config.enableHPP) chain.push(hpp());

// //         if (this.config.enableCORS)
// //             chain.push(this.corsManager.middleware(this.config.cors));

// //         if (this.config.enableSanitizer)
// //             chain.push(this.sanitizerManager.middleware());

// //         if (this.config.enableRateLimiter)
// //             chain.push(this.rateLimitManager.middleware());

// //         // Centralized error handling
// //         chain.push(errorHandler);

// //         return chain;
// //     }
// // }



// // src/core/HiSecure.ts - COMPLETE FIXED
// import { HiSecureConfig } from "./types/HiSecureConfig.js";
// import { defaultConfig } from "./config.js";
// import { LIB_NAME, LIB_VERSION } from "./constants.js";
// import { deepMerge } from "../utils/deepMerge.js";
// import { deepFreeze } from "../utils/deepFreeze.js";
// import { logger } from "../logging/index.js";

// // Adapters
// import { ArgonAdapter } from "../adapters/ArgonAdapter.js";
// import { BcryptAdapter } from "../adapters/BcryptAdapter.js";
// import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter.js";
// import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter.js";
// import { ZodAdapter } from "../adapters/ZodAdapter.js";
// import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter.js";
// import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter.js";
// import { XSSAdapter } from "../adapters/XSSAdapter.js"; // ✅ FIXED IMPORT

// // Managers
// import { HashManager } from "../managers/HashManager.js";
// import { RateLimitManager } from "../managers/RateLimitManager.js";
// import { ValidatorManager } from "../managers/ValidatorManager.js";
// import { SanitizerManager } from "../managers/SanitizerManager.js";
// import { JsonManager } from "../managers/JsonManager.js";
// import { CorsManager } from "../managers/CorsManager.js";
// import { AuthManager } from "../managers/AuthManager.js";

// // Middlewares
// import helmet from "helmet";
// import hpp from "hpp";
// import compression from "compression";
// import { errorHandler } from "../middlewares/errorHandler.js";

// // Types
// import { SecureOptions, ValidationSchema } from "./types/SecureOptions.js";

// export class HiSecure {
//     private static instance: HiSecure | null = null;
//     private config: HiSecureConfig;
//     private initialized = false;

//     // Managers
//     public hashManager!: HashManager;
//     public rateLimitManager!: RateLimitManager;
//     public validatorManager!: ValidatorManager;
//     public sanitizerManager!: SanitizerManager;
//     public jsonManager!: JsonManager;
//     public corsManager!: CorsManager;
//     public authManager?: AuthManager;

//     // Internal adapters
//     private hashingPrimary: any;
//     private hashingFallback: any;
//     private rateLimiterPrimary: any;
//     private rateLimiterFallback: any;
//     private validatorPrimary: any;
//     private validatorFallback: any;
//     private sanitizerPrimary: any;
//     private sanitizerFallback: any;

//     // Private constructor for singleton
//     private constructor(userConfig: Partial<HiSecureConfig> = {}) {
//         this.config = deepMerge(defaultConfig, userConfig);
//     }

//     // =====================================================
//     // SINGLETON & INITIALIZATION
//     // =====================================================
    
//     static getInstance(config?: Partial<HiSecureConfig>): HiSecure {
//         if (!HiSecure.instance) {
//             HiSecure.instance = new HiSecure(config);
//             HiSecure.instance.init();
//         }
//         return HiSecure.instance;
//     }

//     static resetInstance(): void {
//         HiSecure.instance = null;
//     }

//     init(): void {
//         if (this.initialized) {
//             logger.warn("⚠ HiSecure already initialized");
//             return;
//         }

//         logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initializing...`);

//         this.setupAdapters();
//         this.setupManagers();
//         this.setupDynamicManagers();

//         // Make everything immutable
//         deepFreeze(this.config);
//         deepFreeze(this.hashManager);
//         deepFreeze(this.rateLimitManager);
//         deepFreeze(this.validatorManager);
//         deepFreeze(this.sanitizerManager);
//         deepFreeze(this.jsonManager);
//         deepFreeze(this.corsManager);
//         if (this.authManager) deepFreeze(this.authManager);

//         this.initialized = true;
//         logger.info("✅ HiSecure initialized successfully");
//     }

//     isInitialized(): boolean {
//         return this.initialized;
//     }

//     // =====================================================
//     // FLUENT API METHODS (Route-level security)
//     // =====================================================
    
//     static auth(options?: { required?: boolean; roles?: string[] }) {
//         const instance = this.getInstance();
//         if (!instance.authManager) {
//             throw new Error("Auth not enabled. Set auth.enabled=true in config.");
//         }
//         return instance.authManager.protect(options);
//     }

//     static validate(schema: ValidationSchema) {
//         return this.getInstance().validatorManager.validate(schema);
//     }

//     static sanitize(options?: any) {
//         return this.getInstance().sanitizerManager.middleware(options);
//     }

//     static rateLimit(preset: "strict" | "relaxed" | "api" | object) {
//         const instance = this.getInstance();
        
//         if (typeof preset === "string") {
//             const presets = {
//                 strict: { mode: "strict" as const },
//                 relaxed: { mode: "relaxed" as const },
//                 api: { max: 100, windowMs: 60000 }
//             };
//             return instance.rateLimitManager.middleware(presets[preset] || {});
//         }
        
//         return instance.rateLimitManager.middleware({ options: preset });
//     }

//     static cors(options?: any) {
//         return this.getInstance().corsManager.middleware(options);
//     }

//     static json(options?: any) {
//         const instance = this.getInstance();
//         const chain = [];
//         chain.push(instance.jsonManager.middleware(options));
//         chain.push(instance.jsonManager.urlencoded());
//         return chain;
//     }

//     // =====================================================
//     // UTILITY METHODS (Direct usage)
//     // =====================================================
    
//     static async hash(password: string): Promise<string> {
//         const instance = this.getInstance();
//         const result = await instance.hashManager.hash(password, { allowFallback: true });
//         return result.hash;
//     }

//     static async verify(password: string, hash: string): Promise<boolean> {
//         return this.getInstance().hashManager.verify(password, hash);
//     }

//     static jwt = {
//         sign: (payload: object, options?: any) => {
//             const instance = HiSecure.getInstance();
//             if (!instance.authManager) {
//                 throw new Error("Auth not enabled");
//             }
//             return instance.authManager.sign(payload, options);
//         },
        
//         verify: (token: string) => {
//             const instance = HiSecure.getInstance();
//             if (!instance.authManager) {
//                 throw new Error("Auth not enabled");
//             }
//             return instance.authManager.verify(token);
//         },
        
//         google: {
//             verifyIdToken: (idToken: string) => {
//                 const instance = HiSecure.getInstance();
//                 if (!instance.authManager) {
//                     throw new Error("Auth not enabled");
//                 }
//                 return instance.authManager.verifyGoogleIdToken(idToken);
//             }
//         }
//     };

//     // =====================================================
//     // GLOBAL MIDDLEWARE (app.use())
//     // =====================================================
    
//     static middleware(options?: SecureOptions | "api" | "strict" | "public") {
//         const instance = this.getInstance();
        
//         // Handle preset strings
//         if (typeof options === "string") {
//             const presets = {
//                 api: { cors: true, rateLimit: "relaxed", sanitize: true },
//                 strict: { cors: true, rateLimit: "strict", sanitize: true, auth: true },
//                 public: { cors: true, rateLimit: true }
//             };
//             options = presets[options] || {};
//         }
        
//         return instance.createMiddlewareChain(options || {});
//     }

//     // =====================================================
//     // INTERNAL METHODS
//     // =====================================================
    
//     private setupAdapters(): void {
//         logger.info("🧩 Setting up adapters...");

//         // Hashing
//         this.hashingPrimary = this.config.hashing.primary === "argon2"
//             ? new ArgonAdapter()
//             : new BcryptAdapter(this.config.hashing.saltRounds);

//         this.hashingFallback = this.config.hashing.fallback === "bcrypt"
//             ? new BcryptAdapter(this.config.hashing.saltRounds)
//             : null;

//         // Rate limiting
//         this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
//             ? new RLFlexibleAdapter()
//             : new ExpressRLAdapter();
//         this.rateLimiterFallback = new ExpressRLAdapter();

//         // Validation
//         this.validatorPrimary = this.config.validation.mode === "zod"
//             ? new ZodAdapter()
//             : new ExpressValidatorAdapter();
//         this.validatorFallback = this.config.validation.fallback === "express-validator"
//             ? new ExpressValidatorAdapter()
//             : null;

//         // Sanitization
//         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
//         this.sanitizerFallback = new XSSAdapter(this.config.sanitizer); // ✅ XSSAdapter, NOT DomPurifyAdapter

//         logger.info("✅ Adapters ready");
//     }

//     private setupManagers(): void {
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

//     private setupDynamicManagers(): void {
//         this.jsonManager = new JsonManager();
//         this.corsManager = new CorsManager();

//         // Auth manager (only if enabled)
//         if (this.config.auth.enabled) {
//             const jwtSecret = process.env.JWT_SECRET || this.config.auth.jwtSecret;
//             if (!jwtSecret) {
//                 throw new Error("JWT_SECRET environment variable or jwtSecret in config is required when auth.enabled=true");
//             }

//             this.authManager = new AuthManager({
//                 jwtSecret,
//                 jwtExpiresIn: this.config.auth.jwtExpiresIn,
//                 googleClientId: process.env.GOOGLE_CLIENT_ID || this.config.auth.googleClientId,
//                 // ✅ Add algorithm option for JWT security
//                 algorithm: 'HS256'
//             });
//         }
//     }

//     private createMiddlewareChain(options: SecureOptions): any[] {
//         const chain: any[] = [];
        
//         // JSON parsing
//         chain.push(this.jsonManager.middleware(this.config.json));
//         chain.push(this.jsonManager.urlencoded(this.config.urlencoded));
        
//         // Security headers
//         if (this.config.enableHelmet) chain.push(helmet());
//         if (this.config.enableHPP) chain.push(hpp());
        
//         // Compression (check if compression config exists)
//         if (this.config.enableCompression && this.config.compression) {
//             chain.push(compression(this.config.compression));
//         } else if (this.config.enableCompression) {
//             chain.push(compression()); // Use defaults
//         }
        
//         // CORS
//         if (this.config.enableCORS || options.cors) {
//             const corsOptions = options.cors === true ? this.config.cors : 
//                               (typeof options.cors === 'object' ? options.cors : this.config.cors);
//             chain.push(this.corsManager.middleware(corsOptions));
//         }
        
//         // Sanitization
//         if (this.config.enableSanitizer || options.sanitize) {
//             const sanitizeOptions = options.sanitize === true ? undefined : 
//                                   (typeof options.sanitize === 'object' ? options.sanitize : undefined);
//             chain.push(this.sanitizerManager.middleware(sanitizeOptions));
//         }
        
//         // Rate limiting
//         if (this.config.enableRateLimiter || options.rateLimit) {
//             const rateLimitOpts = typeof options.rateLimit === 'object' ? 
//                                 { options: options.rateLimit } : {};
//             chain.push(this.rateLimitManager.middleware(rateLimitOpts));
//         }
        
//         // Authentication
//         if (options.auth && this.authManager) {
//             const authOpts = options.auth === true ? undefined : 
//                            (typeof options.auth === 'object' ? options.auth : undefined);
//             chain.push(this.authManager.protect(authOpts));
//         }
        
//         // Error handler (always last)
//         chain.push(errorHandler);
        
//         return chain;
//     }
// }


// =================

// // src/core/HiSecure.ts - COMPLETELY FIXED
// import { HiSecureConfig } from "./types/HiSecureConfig.js";
// import { defaultConfig } from "./config.js";
// import { LIB_NAME, LIB_VERSION } from "./constants.js";
// import { deepMerge } from "../utils/deepMerge.js";
// import { deepFreeze } from "../utils/deepFreeze.js";
// import { logger } from "../logging/index.js";

// // Adapters
// import { ArgonAdapter } from "../adapters/ArgonAdapter.js";
// import { BcryptAdapter } from "../adapters/BcryptAdapter.js";
// import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter.js";
// import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter.js";
// import { ZodAdapter } from "../adapters/ZodAdapter.js";
// import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter.js";
// import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter.js";
// import { XSSAdapter } from "../adapters/XSSAdapter.js";

// // Managers
// import { HashManager } from "../managers/HashManager.js";
// import { RateLimitManager } from "../managers/RateLimitManager.js";
// import { ValidatorManager } from "../managers/ValidatorManager.js";
// import { SanitizerManager } from "../managers/SanitizerManager.js";
// import { JsonManager } from "../managers/JsonManager.js";
// import { CorsManager } from "../managers/CorsManager.js";
// import { AuthManager } from "../managers/AuthManager.js";

// // Middlewares
// import helmet from "helmet";
// import hpp from "hpp";
// import compression from "compression";
// import { errorHandler } from "../middlewares/errorHandler.js";

// // Types
// import { SecureOptions, ValidationSchema, RateLimitOptions } from "./types/SecureOptions.js";

// export class HiSecure {
//     private static instance: HiSecure | null = null;
//     private config: HiSecureConfig;
//     private initialized = false;

//     // Managers
//     public hashManager!: HashManager;
//     public rateLimitManager!: RateLimitManager;
//     public validatorManager!: ValidatorManager;
//     public sanitizerManager!: SanitizerManager;
//     public jsonManager!: JsonManager;
//     public corsManager!: CorsManager;
//     public authManager?: AuthManager;

//     // Internal adapters
//     private hashingPrimary: any;
//     private hashingFallback: any;
//     private rateLimiterPrimary: any;
//     private rateLimiterFallback: any;
//     private validatorPrimary: any;
//     private validatorFallback: any;
//     private sanitizerPrimary: any;
//     private sanitizerFallback: any;

//     // Private constructor for singleton
//     private constructor(userConfig: Partial<HiSecureConfig> = {}) {
//         this.config = deepMerge(defaultConfig, userConfig);
//     }

//     // =====================================================
//     // SINGLETON & INITIALIZATION
//     // =====================================================
    
//     static getInstance(config?: Partial<HiSecureConfig>): HiSecure {
//         if (!HiSecure.instance) {
//             HiSecure.instance = new HiSecure(config);
//             HiSecure.instance.init();
//         }
//         return HiSecure.instance;
//     }

//     static resetInstance(): void {
//         HiSecure.instance = null;
//     }

//     init(): void {
//         if (this.initialized) {
//             logger.warn("⚠ HiSecure already initialized");
//             return;
//         }

//         logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initializing...`);

//         this.setupAdapters();
//         this.setupManagers();
//         this.setupDynamicManagers();

//         // Make everything immutable
//         deepFreeze(this.config);
//         deepFreeze(this.hashManager);
//         deepFreeze(this.rateLimitManager);
//         deepFreeze(this.validatorManager);
//         deepFreeze(this.sanitizerManager);
//         deepFreeze(this.jsonManager);
//         deepFreeze(this.corsManager);
//         if (this.authManager) deepFreeze(this.authManager);

//         this.initialized = true;
//         logger.info("✅ HiSecure initialized successfully");
//     }

//     isInitialized(): boolean {
//         return this.initialized;
//     }

//     // =====================================================
//     // FLUENT API METHODS (Route-level security)
//     // =====================================================
    
//     static auth(options?: { required?: boolean; roles?: string[] }) {
//         const instance = this.getInstance();
//         if (!instance.authManager) {
//             throw new Error("Auth not enabled. Set auth.enabled=true in config.");
//         }
//         return instance.authManager.protect(options);
//     }

//     static validate(schema: ValidationSchema) {
//         return this.getInstance().validatorManager.validate(schema);
//     }

//     static sanitize(options?: any) {
//         return this.getInstance().sanitizerManager.middleware(options);
//     }

//     static rateLimit(preset: "strict" | "relaxed" | "api" | object) {
//         const instance = this.getInstance();
        
//         if (typeof preset === "string") {
//             const presets: Record<string, { mode?: "strict" | "relaxed" | "api"; options?: any }> = {
//                 strict: { mode: "strict" },
//                 relaxed: { mode: "relaxed" },
//                 api: { mode: "api", options: { max: 100, windowMs: 60000 } }
//             };
//             return instance.rateLimitManager.middleware(presets[preset] || {});
//         }
        
//         return instance.rateLimitManager.middleware({ options: preset });
//     }

//     static cors(options?: any) {
//         return this.getInstance().corsManager.middleware(options);
//     }

//     static json(options?: any) {
//         const instance = this.getInstance();
//         const chain = [];
//         chain.push(instance.jsonManager.middleware(options));
//         chain.push(instance.jsonManager.urlencoded());
//         return chain;
//     }

//     // =====================================================
//     // UTILITY METHODS (Direct usage)
//     // =====================================================
    
//     static async hash(password: string): Promise<string> {
//         const instance = this.getInstance();
//         const result = await instance.hashManager.hash(password, { allowFallback: true });
//         return result.hash;
//     }

//     static async verify(password: string, hash: string): Promise<boolean> {
//         return this.getInstance().hashManager.verify(password, hash);
//     }

//     static jwt = {
//         sign: (payload: object, options?: any) => {
//             const instance = HiSecure.getInstance();
//             if (!instance.authManager) {
//                 throw new Error("Auth not enabled");
//             }
//             return instance.authManager.sign(payload, options);
//         },
        
//         verify: (token: string) => {
//             const instance = HiSecure.getInstance();
//             if (!instance.authManager) {
//                 throw new Error("Auth not enabled");
//             }
//             return instance.authManager.verify(token);
//         },
        
//         google: {
//             verifyIdToken: (idToken: string) => {
//                 const instance = HiSecure.getInstance();
//                 if (!instance.authManager) {
//                     throw new Error("Auth not enabled");
//                 }
//                 return instance.authManager.verifyGoogleIdToken(idToken);
//             }
//         }
//     };

//     // =====================================================
//     // GLOBAL MIDDLEWARE (app.use())
//     // =====================================================
    
//     static middleware(options?: SecureOptions | "api" | "strict" | "public") {
//         const instance = this.getInstance();
        
//         // Handle preset strings
//         if (typeof options === "string") {
//             const presets: Record<string, SecureOptions> = {
//                 api: { cors: true, rateLimit: "relaxed" as any, sanitize: true },
//                 strict: { cors: true, rateLimit: "strict" as any, sanitize: true, auth: true },
//                 public: { cors: true, rateLimit: true as any, sanitize: false }
//             };
//             const presetOptions = presets[options];
//             if (presetOptions) {
//                 return instance.createMiddlewareChain(presetOptions);
//             }
//             return instance.createMiddlewareChain({});
//         }
        
//         return instance.createMiddlewareChain(options || {});
//     }

//     // =====================================================
//     // INTERNAL METHODS
//     // =====================================================
    
//     private setupAdapters(): void {
//         logger.info("🧩 Setting up adapters...");

//         // Hashing
//         this.hashingPrimary = this.config.hashing.primary === "argon2"
//             ? new ArgonAdapter()
//             : new BcryptAdapter(this.config.hashing.saltRounds);

//         this.hashingFallback = this.config.hashing.fallback === "bcrypt"
//             ? new BcryptAdapter(this.config.hashing.saltRounds)
//             : null;

//         // Rate limiting
//         this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
//             ? new RLFlexibleAdapter()
//             : new ExpressRLAdapter();
//         this.rateLimiterFallback = new ExpressRLAdapter();

//         // Validation
//         this.validatorPrimary = this.config.validation.mode === "zod"
//             ? new ZodAdapter()
//             : new ExpressValidatorAdapter();
//         this.validatorFallback = this.config.validation.fallback === "express-validator"
//             ? new ExpressValidatorAdapter()
//             : null;

//         // Sanitization
//         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
//         this.sanitizerFallback = new XSSAdapter(this.config.sanitizer);

//         logger.info("✅ Adapters ready");
//     }

//     private setupManagers(): void {
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
//             // this.config.validation,
//             // this.validatorPrimary,
//             // this.validatorFallback
//             new ZodAdapter(),
//             new ExpressValidatorAdapter()
//         );

//         this.sanitizerManager = new SanitizerManager(
//             this.sanitizerPrimary,
//             this.sanitizerFallback
//         );
//     }

//     private setupDynamicManagers(): void {
//         this.jsonManager = new JsonManager();
//         this.corsManager = new CorsManager();

//         // Auth manager (only if enabled)
//         if (this.config.auth.enabled) {
//             const jwtSecret = process.env.JWT_SECRET || this.config.auth.jwtSecret;
//             if (!jwtSecret) {
//                 throw new Error("JWT_SECRET environment variable or jwtSecret in config is required when auth.enabled=true");
//             }

//             this.authManager = new AuthManager({
//                 jwtSecret,
//                 jwtExpiresIn: this.config.auth.jwtExpiresIn,
//                 googleClientId: process.env.GOOGLE_CLIENT_ID || this.config.auth.googleClientId
//                 // Removed algorithm - handled in AuthManager
//             });
//         }
//     }

//     private createMiddlewareChain(options: SecureOptions): any[] {
//         const chain: any[] = [];
        
//         // JSON parsing
//         chain.push(this.jsonManager.middleware(this.config.json));
//         chain.push(this.jsonManager.urlencoded(this.config.urlencoded));
        
//         // Security headers
//         if (this.config.enableHelmet) chain.push(helmet());
//         if (this.config.enableHPP) chain.push(hpp());
        
//         // Compression (check if compression config exists)
//         if (this.config.enableCompression && this.config.compression) {
//             chain.push(compression(this.config.compression));
//         } else if (this.config.enableCompression) {
//             chain.push(compression()); // Use defaults
//         }
        
//         // CORS
//         if (this.config.enableCORS || options.cors) {
//             const corsOptions = options.cors === true ? this.config.cors : 
//                               (typeof options.cors === 'object' ? options.cors : this.config.cors);
//             chain.push(this.corsManager.middleware(corsOptions));
//         }
        
//         // Sanitization
//         if (this.config.enableSanitizer || options.sanitize) {
//             const sanitizeOptions = options.sanitize === true ? undefined : 
//                                   (typeof options.sanitize === 'object' ? options.sanitize : undefined);
//             chain.push(this.sanitizerManager.middleware(sanitizeOptions));
//         }
        
//         // Rate limiting
//         if (this.config.enableRateLimiter || options.rateLimit) {
//             const rateLimitOpts = typeof options.rateLimit === 'object' ? 
//                                 { options: options.rateLimit } : {};
//             chain.push(this.rateLimitManager.middleware(rateLimitOpts));
//         }
        
//         // Authentication
//         if (options.auth && this.authManager) {
//             const authOpts = options.auth === true ? undefined : 
//                            (typeof options.auth === 'object' ? options.auth : undefined);
//             chain.push(this.authManager.protect(authOpts));
//         }
        
//         // Error handler (always last)
//         chain.push(errorHandler);
        
//         return chain;
//     }
// }


// ===================

// src/core/HiSecure.ts - FINAL VERSION
import { HiSecureConfig } from "./types/HiSecureConfig.js";
import { defaultConfig } from "./config.js";
import { LIB_NAME, LIB_VERSION } from "./constants.js";
import { deepMerge } from "../utils/deepMerge.js";
import { deepFreeze } from "../utils/deepFreeze.js";
import { logger } from "../logging/index.js";

// Adapters
import { ArgonAdapter } from "../adapters/ArgonAdapter.js";
import { BcryptAdapter } from "../adapters/BcryptAdapter.js";
import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter.js";
import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter.js";
import { ZodAdapter } from "../adapters/ZodAdapter.js";
import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter.js";
import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter.js";
import { XSSAdapter } from "../adapters/XSSAdapter.js";

// Managers
import { HashManager } from "../managers/HashManager.js";
import { RateLimitManager } from "../managers/RateLimitManager.js";
import { ValidatorManager } from "../managers/ValidatorManager.js";
import { SanitizerManager } from "../managers/SanitizerManager.js";
import { JsonManager } from "../managers/JsonManager.js";
import { CorsManager } from "../managers/CorsManager.js";
import { AuthManager } from "../managers/AuthManager.js";

// Middlewares
import helmet from "helmet";
import hpp from "hpp";
import compression from "compression";
import { errorHandler } from "../middlewares/errorHandler.js";

// Types
import { SecureOptions, ValidationSchema } from "./types/SecureOptions.js";

export class HiSecure {
    private static instance: HiSecure | null = null;
    private config: HiSecureConfig;
    private initialized = false;

    // Managers
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

    private constructor(userConfig: Partial<HiSecureConfig> = {}) {
        this.config = deepMerge(defaultConfig, userConfig);
    }

    // =====================================================
    // SINGLETON
    // =====================================================
    static getInstance(config?: Partial<HiSecureConfig>): HiSecure {
        if (!HiSecure.instance) {
            HiSecure.instance = new HiSecure(config);
            HiSecure.instance.init();
        }
        return HiSecure.instance;
    }

    static resetInstance(): void {
        HiSecure.instance = null;
    }

    init(): void {
        if (this.initialized) return;

        logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initializing...`);

        this.setupAdapters();
        this.setupManagers();
        this.setupDynamicManagers();

        // ❌ DO NOT FREEZE MANAGERS
        // ✔ Only freeze config
        deepFreeze(this.config);

        this.initialized = true;
        logger.info("✅ HiSecure initialized successfully");
    }

    // =====================================================
    // FLUENT API (Route-level)
    // =====================================================

    static auth(options?: { required?: boolean; roles?: string[] }) {
        return this.getInstance().authManager!.protect(options);
    }

    static validate(schema: ValidationSchema) {
        return this.getInstance().validatorManager.validate(schema);
    }

    static sanitize(options?: any) {
        return this.getInstance().sanitizerManager.middleware(options);
    }

    static cors(options?: any) {
        return this.getInstance().corsManager.middleware(options);
    }

    static rateLimit(preset: "strict" | "relaxed" | "api" | object) {
        const instance = this.getInstance();

        if (typeof preset === "string") {
            const presets: any = {
                strict: { mode: "strict" },
                relaxed: { mode: "relaxed" },
                api: { mode: "api", options: { max: 100, windowMs: 60000 } }
            };
            return instance.rateLimitManager.middleware(presets[preset] || {});
        }
        return instance.rateLimitManager.middleware({ options: preset });
    }

    static json(options?: any) {
        const instance = this.getInstance();
        return [
            instance.jsonManager.middleware(options),
            instance.jsonManager.urlencoded()
        ];
    }

    // =====================================================
    // INTERNAL SETUP
    // =====================================================

    private setupAdapters(): void {
        logger.info("🧩 Setting up adapters...");

        this.hashingPrimary = this.config.hashing.primary === "argon2"
            ? new ArgonAdapter()
            : new BcryptAdapter(this.config.hashing.saltRounds);

        this.hashingFallback = this.config.hashing.fallback === "bcrypt"
            ? new BcryptAdapter(this.config.hashing.saltRounds)
            : null;

        this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
            ? new RLFlexibleAdapter()
            : new ExpressRLAdapter();

        this.rateLimiterFallback = new ExpressRLAdapter();

        logger.info("✅ Adapters ready");
    }

    private setupManagers(): void {
        this.hashManager = new HashManager(this.config.hashing, this.hashingPrimary, this.hashingFallback);

        this.rateLimitManager = new RateLimitManager(
            this.config.rateLimiter,
            this.rateLimiterPrimary,
            this.rateLimiterFallback
        );

        // ✔ AUTO-DETECT VALIDATION (ZOD + EXPRESS-VALIDATOR)
        this.validatorManager = new ValidatorManager(
            new ZodAdapter(),
            new ExpressValidatorAdapter()
        );

        this.sanitizerManager = new SanitizerManager(
            new SanitizeHtmlAdapter(this.config.sanitizer),
            new XSSAdapter(this.config.sanitizer)
        );
    }

    private setupDynamicManagers(): void {
        this.jsonManager = new JsonManager();
        this.corsManager = new CorsManager();

        if (this.config.auth.enabled) {
            const jwtSecret = process.env.JWT_SECRET || this.config.auth.jwtSecret;
            if (!jwtSecret) throw new Error("JWT_SECRET is required when auth.enabled=true");

            this.authManager = new AuthManager({
                jwtSecret,
                jwtExpiresIn: this.config.auth.jwtExpiresIn,
                googleClientId: this.config.auth.googleClientId
            });
        }
    }

    private createMiddlewareChain(options: SecureOptions): any[] {
        const chain: any[] = [];

        chain.push(this.jsonManager.middleware(this.config.json));
        chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

        if (this.config.enableHelmet) chain.push(helmet());
        if (this.config.enableHPP) chain.push(hpp());

        if (this.config.enableCompression) chain.push(compression(this.config.compression));

        if (this.config.enableCORS || options.cors) {
            const opts = typeof options.cors === "object" ? options.cors : this.config.cors;
            chain.push(this.corsManager.middleware(opts));
        }

        if (this.config.enableSanitizer || options.sanitize) {
            const opts = typeof options.sanitize === "object" ? options.sanitize : undefined;
            chain.push(this.sanitizerManager.middleware(opts));
        }

        if (this.config.enableRateLimiter || options.rateLimit) {
            const opts = typeof options.rateLimit === "object" ? { options: options.rateLimit } : {};
            chain.push(this.rateLimitManager.middleware(opts));
        }

        if (options.auth && this.authManager) {
            const opts = typeof options.auth === "object" ? options.auth : undefined;
            chain.push(this.authManager.protect(opts));
        }

        chain.push(errorHandler);

        return chain;
    }
}
