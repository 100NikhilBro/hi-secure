import { defaultConfig, HiSecureConfig } from "./config";
import { LIB_NAME, LIB_VERSION } from "./constants";
import { deepMerge } from "../utils/deepMerge";

// Adapters
import { ArgonAdapter } from "../adapters/ArgonAdapter";
import { BcryptAdapter } from "../adapters/BcryptAdapter";
import { RLFlexibleAdapter } from "../adapters/RLFlexibleAdapter";
import { ExpressRLAdapter } from "../adapters/ExpressRLAdapter";
import { ZodAdapter } from "../adapters/ZodAdapter";
import { ExpressValidatorAdapter } from "../adapters/ExpressValidatorAdapter";
import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter";
import { DomPurifyAdapter } from "../adapters/DomPurifyAdapter";   // ⭐ Added

// Managers
import { HashManager } from "../managers/HashManagers";
import { RateLimitManager } from "../managers/RateLimitManager";
import { ValidatorManager } from "../managers/ValidatorManager";
import { SanitizerManager } from "../managers/SanitizerManager";

// Default Express middlewares
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";

export class HiSecure {
    private config: HiSecureConfig;

    // Managers
    private hashManager!: HashManager;
    private rateLimitManager!: RateLimitManager;
    private validatorManager!: ValidatorManager;
    private sanitizerManager!: SanitizerManager;

    // Adapters
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

    init() {
        console.log(`\n🔐 ${LIB_NAME} v${LIB_VERSION} initialized`);
        console.log("⚡ Loaded config:", this.config);

        this.setupAdapters();
        this.setupManagers();
    }

    // -----------------------------
    // STEP 1: Setup all adapters
    // -----------------------------
    private setupAdapters() {
        console.log("🧩 Setting up adapters...");

        // Hash adapters
        this.hashingPrimary =
            this.config.hashing.primary === "argon2"
                ? new ArgonAdapter()
                : new BcryptAdapter(this.config.hashing.saltRounds);

        this.hashingFallback =
            this.config.hashing.fallback === "bcrypt"
                ? new BcryptAdapter(this.config.hashing.saltRounds)
                : null;

// Rate limiter adapters
this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
    ? new RLFlexibleAdapter(this.config.rateLimiter)
    : new ExpressRLAdapter(this.config.rateLimiter);

// Fallback always express-based
this.rateLimiterFallback = new ExpressRLAdapter(this.config.rateLimiter);


        // Validation adapters
        this.validatorPrimary =
            this.config.validation.mode === "zod"
                ? new ZodAdapter()
                : new ExpressValidatorAdapter();

        this.validatorFallback =
            this.config.validation.fallback === "express-validator"
                ? new ExpressValidatorAdapter()
                : null;

        // Sanitizer primary + fallback
        this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
        this.sanitizerFallback = new DomPurifyAdapter(); // ⭐ fallback

        console.log("✔ Adapters ready");
    }

    // -----------------------------
    // STEP 2: Setup managers
    // -----------------------------
    private setupManagers() {
        console.log("🗂 Setting up managers...");

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

        console.log("✔ Managers ready");
    }

    // Public API
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

    // EXPRESS MIDDLEWARE PIPELINE
    middleware() {
        const chain: any[] = [];

        if (this.config.enableHelmet) chain.push(helmet());
        if (this.config.enableHPP) chain.push(hpp());
        if (this.config.enableCORS) chain.push(cors());

        if (this.config.enableSanitizer) {
            chain.push(this.sanitizerPrimary.middleware());
        }

        if (this.config.enableRateLimiter) {
            chain.push(this.rateLimitManager.middleware());
        }

        return chain;
    }
}
