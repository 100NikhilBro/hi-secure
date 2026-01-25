// import { HiSecureConfig } from "./types/HiSecureConfig.js";
// import { defaultConfig } from "./config.js";
// import { LIB_NAME, LIB_VERSION } from "./constants.js";
// import { deepMerge } from "../utils/deepMerge.js";
// import { deepFreeze } from "../utils/deepFreeze.js";
// import { logger } from "../logging";

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
//     private sanitizerPrimary: any;
//     private sanitizerFallback: any;

//     private constructor(userConfig: Partial<HiSecureConfig> = {}) {
//         this.config = deepMerge(defaultConfig, userConfig);
//     }

//     // Singleton & Init

//     static getInstance(config?: Partial<HiSecureConfig>): HiSecure {
//         if (!HiSecure.instance) {
//             logger.info("Creating HiSecure singleton", {
//                 layer: "hisecure-core"
//             });
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
//             logger.warn("Initialization skipped (already initialized)", {
//                 layer: "hisecure-core"
//             });
//             return;
//         }

//         logger.info("Framework initialization started", {
//             layer: "hisecure-core",
//             lib: LIB_NAME,
//             version: LIB_VERSION
//         });

//         this.setupAdapters();
//         this.setupManagers();
//         this.setupDynamicManagers();

//         deepFreeze(this.config);
//         this.initialized = true;

//         logger.info("Framework initialized successfully", {
//             layer: "hisecure-core"
//         });
//     }

//     // Public Fluent API
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
//             logger.info("Rate limit preset applied", {
//                 layer: "hisecure-core",
//                 preset
//             });

//             const presets: any = {
//                 strict: { mode: "strict" },
//                 relaxed: { mode: "relaxed" },
//                 api: { mode: "api" }
//             };
//             return instance.rateLimitManager.middleware(presets[preset]);
//         }

//         return instance.rateLimitManager.middleware({ options: preset });
//     }

//     static cors(options?: any) {
//         return this.getInstance().corsManager.middleware(options);
//     }

//     static json(options?: any) {
//         const instance = this.getInstance();
//         return [
//             instance.jsonManager.middleware(options),
//             instance.jsonManager.urlencoded()
//         ];
//     }

//     // Utilities

//     static async hash(value: string): Promise<string> {
//         const instance = this.getInstance();
//         const result = await instance.hashManager.hash(value, { allowFallback: true });
//         return result.hash;
//     }

//     static async verify(value: string, hash: string): Promise<boolean> {
//         return this.getInstance().hashManager.verify(value, hash);
//     }

//     static jwt = {
//         sign: (payload: object, options?: any) =>
//             HiSecure.getInstance().authManager!.sign(payload, options),

//         verify: (token: string) =>
//             HiSecure.getInstance().authManager!.verify(token),

//         google: {
//             verifyIdToken: (idToken: string) =>
//                 HiSecure.getInstance().authManager!.verifyGoogleIdToken(idToken)
//         }
//     };

//     // Global Middleware - globalLevel
//     static middleware(options?: SecureOptions | "api" | "strict" | "public") {
//         const instance = this.getInstance();

//         if (typeof options === "string") {
//             logger.info("Global middleware preset applied", {
//                 layer: "hisecure-core",
//                 preset: options
//             });

//             const presets: any = {
//                 api: { cors: true, rateLimit: "relaxed", sanitize: true },
//                 strict: { cors: true, rateLimit: "strict", sanitize: true, auth: true },
//                 public: { cors: true, rateLimit: true, sanitize: false }
//             };

//             return instance.createMiddlewareChain(presets[options] || {});
//         }

//         return instance.createMiddlewareChain(options || {});
//     }

//     // Internal Setup

//     private setupAdapters() {
//         logger.info("Adapters setup started", {
//             layer: "hisecure-core"
//         });

//         this.hashingPrimary =
//             this.config.hashing.primary === "argon2"
//                 ? new ArgonAdapter()
//                 : new BcryptAdapter(this.config.hashing.saltRounds);

//         this.hashingFallback =
//             this.config.hashing.fallback === "bcrypt"
//                 ? new BcryptAdapter(this.config.hashing.saltRounds)
//                 : null;

//         logger.info("Hashing adapters configured", {
//             layer: "hisecure-core",
//             primary: this.config.hashing.primary,
//             fallback: this.config.hashing.fallback ?? null
//         });

//         this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
//             ? new RLFlexibleAdapter()
//             : new ExpressRLAdapter();

//         this.rateLimiterFallback = new ExpressRLAdapter();

//         logger.info("Rate limiter adapters configured", {
//             layer: "hisecure-core",
//             adaptive: this.config.rateLimiter.useAdaptiveMode
//         });

//         this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
//         this.sanitizerFallback = new XSSAdapter(this.config.sanitizer);

//         logger.info("Sanitizer adapters configured", {
//             layer: "hisecure-core",
//             primary: "sanitize-html",
//             fallback: "xss"
//         });
//     }

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
//             new ZodAdapter(),
//             new ExpressValidatorAdapter()
//         );

//         this.sanitizerManager = new SanitizerManager(
//             this.sanitizerPrimary,
//             this.sanitizerFallback
//         );

//         logger.info("Core managers initialized", {
//             layer: "hisecure-core",
//             managers: ["hash", "rate-limit", "validator", "sanitizer"]
//         });
//     }

//     private setupDynamicManagers() {
//         this.jsonManager = new JsonManager();
//         this.corsManager = new CorsManager();

//         if (this.config.auth.enabled) {
//             this.authManager = new AuthManager({
//                 jwtSecret: process.env.JWT_SECRET || this.config.auth.jwtSecret!,
//                 jwtExpiresIn: this.config.auth.jwtExpiresIn,
//                 googleClientId:
//                     process.env.GOOGLE_CLIENT_ID || this.config.auth.googleClientId
//             });

//             logger.info("Authentication enabled", {
//                 layer: "hisecure-core",
//                 google: !!this.config.auth.googleClientId
//             });
//         } else {
//             logger.info("Authentication disabled", {
//                 layer: "hisecure-core"
//             });
//         }
//     }

//     private createMiddlewareChain(options: SecureOptions): any[] {
//         const chain: any[] = [];

//         chain.push(this.jsonManager.middleware(this.config.json));
//         chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

//         if (this.config.enableHelmet) chain.push(helmet());
//         if (this.config.enableHPP) chain.push(hpp());

//         if (this.config.enableCompression)
//             chain.push(compression(this.config.compression));

//         if (options.cors) chain.push(this.corsManager.middleware(this.config.cors));
//         if (options.sanitize)
//             chain.push(this.sanitizerManager.middleware());

//         if (options.rateLimit)
//             chain.push(this.rateLimitManager.middleware({}));

//         if (options.auth && this.authManager)
//             chain.push(this.authManager.protect());

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

type MiddlewarePreset = "strict" | "api" | "public";

export class HiSecure {
  private static instance: HiSecure | null = null;

  private readonly config: HiSecureConfig;
  private initialized = false;

  private hashManager!: HashManager;
  private rateLimitManager!: RateLimitManager;
  private validatorManager!: ValidatorManager;
  private sanitizerManager!: SanitizerManager;
  private jsonManager!: JsonManager;
  private corsManager!: CorsManager;
  private authManager?: AuthManager;

  private constructor(config: HiSecureConfig) {
    this.config = config;
  }

  // ================= INIT (ONLY ONCE) =================
  static init(userConfig?: Partial<HiSecureConfig>): HiSecure {
    if (HiSecure.instance) return HiSecure.instance;

    const finalConfig = deepMerge(defaultConfig, userConfig ?? {});
    const instance = new HiSecure(finalConfig);
    HiSecure.instance = instance;
    instance.bootstrap();
    return instance;
  }

  private static get(): HiSecure {
    if (!HiSecure.instance) {
      throw new Error("HiSecure not initialized. Call HiSecure.init() first.");
    }
    return HiSecure.instance;
  }

  private bootstrap(): void {
    if (this.initialized) return;

    logger.info("Framework initialization started", {
      layer: "hisecure-core",
      lib: LIB_NAME,
      version: LIB_VERSION
    });

    // ===== Core Managers =====
    this.hashManager = new HashManager(
      this.config.hashing,
      this.config.hashing.primary === "argon2"
        ? new ArgonAdapter()
        : new BcryptAdapter(this.config.hashing.saltRounds),
      this.config.hashing.fallback
        ? new BcryptAdapter(this.config.hashing.saltRounds)
        : null
    );

    this.rateLimitManager = new RateLimitManager(
      this.config.rateLimiter,
      this.config.rateLimiter.useAdaptiveMode
        ? new RLFlexibleAdapter()
        : new ExpressRLAdapter(),
      new ExpressRLAdapter()
    );

    this.validatorManager = new ValidatorManager(
      new ZodAdapter(),
      new ExpressValidatorAdapter()
    );

    this.sanitizerManager = new SanitizerManager(
      new SanitizeHtmlAdapter(this.config.sanitizer),
      new XSSAdapter(this.config.sanitizer)
    );

    this.jsonManager = new JsonManager();
    this.corsManager = new CorsManager();

    // ===== Auth (OPTIONAL) =====
    if (this.config.auth?.enabled) {
      this.authManager = new AuthManager({
        jwtSecret: process.env.JWT_SECRET || this.config.auth.jwtSecret!,
        jwtExpiresIn: this.config.auth.jwtExpiresIn,
        googleClientId:
          process.env.GOOGLE_CLIENT_ID || this.config.auth.googleClientId
      });

      logger.info("Authentication enabled", { layer: "hisecure-core" });
    } else {
      logger.info("Authentication disabled", { layer: "hisecure-core" });
    }

    deepFreeze(this.config);
    this.initialized = true;

    logger.info("Framework initialized successfully", {
      layer: "hisecure-core"
    });
  }

  // ================= PUBLIC STATIC API =================

  static auth(options?: { required?: boolean; roles?: string[] }) {
    const i = HiSecure.get();
    if (!i.authManager) throw new Error("Auth not enabled");
    return i.authManager.protect(options);
  }

  static validate(schema: ValidationSchema) {
    return HiSecure.get().validatorManager.validate(schema);
  }

  static sanitize(options?: any) {
    return HiSecure.get().sanitizerManager.middleware(options);
  }

  static rateLimit(preset: "strict" | "relaxed" | "api" | object) {
    const i = HiSecure.get();

    if (typeof preset === "string") {
      const presets = {
        strict: { mode: "strict" },
        relaxed: { mode: "relaxed" },
        api: { mode: "api" }
      } as const;

      return i.rateLimitManager.middleware(presets[preset]);
    }

    return i.rateLimitManager.middleware({ options: preset });
  }

  static cors(options?: any) {
    return HiSecure.get().corsManager.middleware(options);
  }

  static json(options?: any) {
    const i = HiSecure.get();
    return [i.jsonManager.middleware(options), i.jsonManager.urlencoded()];
  }

  static async hash(value: string): Promise<string> {
    const { hash } = await HiSecure.get().hashManager.hash(value, {
      allowFallback: true
    });
    return hash;
  }

  static verify(value: string, hash: string): Promise<boolean> {
    return HiSecure.get().hashManager.verify(value, hash);
  }

  static middleware(options?: SecureOptions | MiddlewarePreset) {
    const i = HiSecure.get();

    const presets: Record<MiddlewarePreset, SecureOptions> = {
      strict: { cors: true, rateLimit: "strict", sanitize: true, auth: true },
      api: { cors: true, rateLimit: "relaxed", sanitize: true },
      public: { cors: true, rateLimit: true }
    };

    const finalOptions =
      typeof options === "string" ? presets[options] : options ?? {};

    return i.createChain(finalOptions);
  }

  // ================= INTERNAL =================

  private createChain(options: SecureOptions): any[] {
    const chain: any[] = [];

    chain.push(this.jsonManager.middleware(this.config.json));
    chain.push(this.jsonManager.urlencoded(this.config.urlencoded));

    if (this.config.enableHelmet) chain.push(helmet());
    if (this.config.enableHPP) chain.push(hpp());
    if (this.config.enableCompression)
      chain.push(compression(this.config.compression));

    if (options.cors) chain.push(this.corsManager.middleware());
    if (options.sanitize) chain.push(this.sanitizerManager.middleware());
    if (options.rateLimit)
      chain.push(this.rateLimitManager.middleware({}));
    if (options.auth && this.authManager)
      chain.push(this.authManager.protect());

    chain.push(errorHandler);
    return chain;
  }
}
