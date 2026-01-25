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

  static auth(options?: { required?: boolean; roles?: string[] }) {
    const i = HiSecure.get();
    if (!i.authManager) throw new Error("Auth not enabled");
    return i.authManager.protect(options);
  }

  static jwt = {
    sign(payload: object, options?: any) {
      const i = HiSecure.get();
      if (!i.authManager) throw new Error("Auth not enabled");
      return i.authManager.sign(payload, options);
    },

    verify(token: string) {
      const i = HiSecure.get();
      if (!i.authManager) throw new Error("Auth not enabled");
      return i.authManager.verify(token);
    },

    google: {
      verifyIdToken(idToken: string) {
        const i = HiSecure.get();
        if (!i.authManager)
          throw new Error("Auth not enabled (Google)");
        return i.authManager.verifyGoogleIdToken(idToken);
      }
    }
  };

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
