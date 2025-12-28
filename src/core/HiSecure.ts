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
// import { SecureOptions, ValidationSchema} from "./types/SecureOptions.js";

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
//     private sanitizerPrimary: any;
//     private sanitizerFallback: any;

//     // Private constructor for singleton
//     private constructor(userConfig: Partial<HiSecureConfig> = {}) {
//         this.config = deepMerge(defaultConfig, userConfig);
//     }

//     // SINGLETON & INITIALIZATION
    
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
//             logger.warn(" HiSecure already initialized");
//             return;
//         }

//         logger.info(` ${LIB_NAME} v${LIB_VERSION} initializing...`);

//         this.setupAdapters();
//         this.setupManagers();
//         this.setupDynamicManagers();

//         deepFreeze(this.config);
//         // deep Freeze - for now we remove from manager it needs to manage the adapters
//         // deepFreeze(this.hashManager);
//         // deepFreeze(this.rateLimitManager);
//         // deepFreeze(this.validatorManager);
//         // deepFreeze(this.sanitizerManager);
//         // deepFreeze(this.jsonManager);
//         // deepFreeze(this.corsManager);
//         // if (this.authManager) deepFreeze(this.authManager);

//         this.initialized = true;
//         logger.info("HiSecure initialized successfully");
//     }

//     isInitialized(): boolean {
//         return this.initialized;
//     }

//     // FLUENT API METHODS (Route-level security)
    
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

//     // UTILITY METHODS - For direct use
    
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

//     // GLOBAL MIDDLEWARE (app.use())
    
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

   
//     // Internal Methods
    
//     private setupAdapters(): void {
//         logger.info(" Setting up adapters...");

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




//         // // Validation - we handle this in d/f way for now 
//         // this.validatorPrimary = this.config.validation.mode === "zod"
//         //     ? new ZodAdapter()
//         //     : new ExpressValidatorAdapter();
//         // this.validatorFallback = this.config.validation.fallback === "express-validator"
//         //     ? new ExpressValidatorAdapter()
//         //     : null;


//         // Sanitization
//         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
//         this.sanitizerFallback = new XSSAdapter(this.config.sanitizer);

//         logger.info("Adapters ready");
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
        
//         // Error handler - at last usage
//         chain.push(errorHandler);
        
//         return chain;
//     }
// }








import { HiSecureConfig } from "./types/HiSecureConfig.js";
import { defaultConfig } from "./config.js";
import { LIB_NAME, LIB_VERSION } from "./constants.js";
import { deepMerge } from "../utils/deepMerge.js";
import { deepFreeze } from "../utils/deepFreeze.js";
import { logger } from "../logging";

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
    private sanitizerPrimary: any;
    private sanitizerFallback: any;

    private constructor(userConfig: Partial<HiSecureConfig> = {}) {
        this.config = deepMerge(defaultConfig, userConfig);
    }

    // =========================
    // Singleton & Init
    // =========================

    static getInstance(config?: Partial<HiSecureConfig>): HiSecure {
        if (!HiSecure.instance) {
            logger.info("Creating HiSecure singleton", {
                layer: "hisecure-core"
            });
            HiSecure.instance = new HiSecure(config);
            HiSecure.instance.init();
        }
        return HiSecure.instance;
    }

    static resetInstance(): void {
        HiSecure.instance = null;
    }

    init(): void {
        if (this.initialized) {
            logger.warn("Initialization skipped (already initialized)", {
                layer: "hisecure-core"
            });
            return;
        }

        logger.info("Framework initialization started", {
            layer: "hisecure-core",
            lib: LIB_NAME,
            version: LIB_VERSION
        });

        this.setupAdapters();
        this.setupManagers();
        this.setupDynamicManagers();

        deepFreeze(this.config);
        this.initialized = true;

        logger.info("Framework initialized successfully", {
            layer: "hisecure-core"
        });
    }

    // =========================
    // Public Fluent APIs
    // =========================

    static auth(options?: { required?: boolean; roles?: string[] }) {
        const instance = this.getInstance();
        if (!instance.authManager) {
            throw new Error("Auth not enabled. Set auth.enabled=true in config.");
        }
        return instance.authManager.protect(options);
    }

    static validate(schema: ValidationSchema) {
        return this.getInstance().validatorManager.validate(schema);
    }

    static sanitize(options?: any) {
        return this.getInstance().sanitizerManager.middleware(options);
    }

    static rateLimit(preset: "strict" | "relaxed" | "api" | object) {
        const instance = this.getInstance();

        if (typeof preset === "string") {
            logger.info("Rate limit preset applied", {
                layer: "hisecure-core",
                preset
            });

            const presets: any = {
                strict: { mode: "strict" },
                relaxed: { mode: "relaxed" },
                api: { mode: "api" }
            };
            return instance.rateLimitManager.middleware(presets[preset]);
        }

        return instance.rateLimitManager.middleware({ options: preset });
    }

    static cors(options?: any) {
        return this.getInstance().corsManager.middleware(options);
    }

    static json(options?: any) {
        const instance = this.getInstance();
        return [
            instance.jsonManager.middleware(options),
            instance.jsonManager.urlencoded()
        ];
    }

    // =========================
    // Utilities
    // =========================

    static async hash(value: string): Promise<string> {
        const instance = this.getInstance();
        const result = await instance.hashManager.hash(value, { allowFallback: true });
        return result.hash;
    }

    static async verify(value: string, hash: string): Promise<boolean> {
        return this.getInstance().hashManager.verify(value, hash);
    }

    static jwt = {
        sign: (payload: object, options?: any) =>
            HiSecure.getInstance().authManager!.sign(payload, options),

        verify: (token: string) =>
            HiSecure.getInstance().authManager!.verify(token),

        google: {
            verifyIdToken: (idToken: string) =>
                HiSecure.getInstance().authManager!.verifyGoogleIdToken(idToken)
        }
    };

    // =========================
    // Global Middleware
    // =========================

    static middleware(options?: SecureOptions | "api" | "strict" | "public") {
        const instance = this.getInstance();

        if (typeof options === "string") {
            logger.info("Global middleware preset applied", {
                layer: "hisecure-core",
                preset: options
            });

            const presets: any = {
                api: { cors: true, rateLimit: "relaxed", sanitize: true },
                strict: { cors: true, rateLimit: "strict", sanitize: true, auth: true },
                public: { cors: true, rateLimit: true, sanitize: false }
            };

            return instance.createMiddlewareChain(presets[options] || {});
        }

        return instance.createMiddlewareChain(options || {});
    }

    // =========================
    // Internal Setup
    // =========================

    private setupAdapters() {
        logger.info("Adapters setup started", {
            layer: "hisecure-core"
        });

        this.hashingPrimary =
            this.config.hashing.primary === "argon2"
                ? new ArgonAdapter()
                : new BcryptAdapter(this.config.hashing.saltRounds);

        this.hashingFallback =
            this.config.hashing.fallback === "bcrypt"
                ? new BcryptAdapter(this.config.hashing.saltRounds)
                : null;

        logger.info("Hashing adapters configured", {
            layer: "hisecure-core",
            primary: this.config.hashing.primary,
            fallback: this.config.hashing.fallback ?? null
        });

        this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
            ? new RLFlexibleAdapter()
            : new ExpressRLAdapter();

        this.rateLimiterFallback = new ExpressRLAdapter();

        logger.info("Rate limiter adapters configured", {
            layer: "hisecure-core",
            adaptive: this.config.rateLimiter.useAdaptiveMode
        });

        this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
        this.sanitizerFallback = new XSSAdapter(this.config.sanitizer);

        logger.info("Sanitizer adapters configured", {
            layer: "hisecure-core",
            primary: "sanitize-html",
            fallback: "xss"
        });
    }

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
            new ZodAdapter(),
            new ExpressValidatorAdapter()
        );

        this.sanitizerManager = new SanitizerManager(
            this.sanitizerPrimary,
            this.sanitizerFallback
        );

        logger.info("Core managers initialized", {
            layer: "hisecure-core",
            managers: ["hash", "rate-limit", "validator", "sanitizer"]
        });
    }

    private setupDynamicManagers() {
        this.jsonManager = new JsonManager();
        this.corsManager = new CorsManager();

        if (this.config.auth.enabled) {
            this.authManager = new AuthManager({
                jwtSecret: process.env.JWT_SECRET || this.config.auth.jwtSecret!,
                jwtExpiresIn: this.config.auth.jwtExpiresIn,
                googleClientId:
                    process.env.GOOGLE_CLIENT_ID || this.config.auth.googleClientId
            });

            logger.info("Authentication enabled", {
                layer: "hisecure-core",
                google: !!this.config.auth.googleClientId
            });
        } else {
            logger.info("Authentication disabled", {
                layer: "hisecure-core"
            });
        }
    }

    private createMiddlewareChain(options: SecureOptions): any[] {
        const chain: any[] = [];

        chain.push(this.jsonManager.middleware(this.config.json));
        chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

        if (this.config.enableHelmet) chain.push(helmet());
        if (this.config.enableHPP) chain.push(hpp());

        if (this.config.enableCompression)
            chain.push(compression(this.config.compression));

        if (options.cors) chain.push(this.corsManager.middleware(this.config.cors));
        if (options.sanitize)
            chain.push(this.sanitizerManager.middleware());

        if (options.rateLimit)
            chain.push(this.rateLimitManager.middleware({}));

        if (options.auth && this.authManager)
            chain.push(this.authManager.protect());

        chain.push(errorHandler);
        return chain;
    }
}
