import { defaultConfig, HiSecureConfig } from "./config";
import { LIB_NAME, LIB_VERSION } from "./constants";
import { deepMerge } from "../utils/deepMerge";
import { deepFreeze } from "../utils/deepFreeze";

// Logging
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
import { HashManager } from "../managers/HashManagers";
import { RateLimitManager } from "../managers/RateLimitManager";
import { ValidatorManager } from "../managers/ValidatorManager";
import { SanitizerManager } from "../managers/SanitizerManager";

// Middlewares
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import express from "express";

// Error Handler
import { errorHandler } from "../middlewares/errorHandler";

export class HiSecure {
    private config: HiSecureConfig;
    private initialized = false;

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
        if (this.initialized) {
            logger.warn("⚠ HiSecure.init() called again → ignored.");
            return;
        }

        logger.info(`🔐 ${LIB_NAME} v${LIB_VERSION} initialized`);
        logger.info("⚙️ Loaded configuration:", this.config);

        this.setupAdapters();
        this.setupManagers();

        // 🔒 Deep freeze EVERYTHING → full immutability
        deepFreeze(this.config);
        deepFreeze(this.hashManager);
        deepFreeze(this.rateLimitManager);
        deepFreeze(this.validatorManager);
        deepFreeze(this.sanitizerManager);

        this.initialized = true;
        logger.info("🔒 HiSecure fully locked & immutable — Ready for production");
    }

    isInitialized() {
        return this.initialized;
    }

    // ---------------------------------------------
    // Adapter Setup
    // ---------------------------------------------
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

        // Rate Limiter
        this.rateLimiterPrimary = this.config.rateLimiter.useAdaptiveMode
            ? new RLFlexibleAdapter(this.config.rateLimiter)
            : new ExpressRLAdapter(this.config.rateLimiter);

        this.rateLimiterFallback = new ExpressRLAdapter(this.config.rateLimiter);

        // Validators
        this.validatorPrimary =
            this.config.validation.mode === "zod"
                ? new ZodAdapter()
                : new ExpressValidatorAdapter();

        this.validatorFallback =
            this.config.validation.fallback === "express-validator"
                ? new ExpressValidatorAdapter()
                : null;

        // Sanitizers
        this.sanitizerPrimary = new SanitizeHtmlAdapter(this.config.sanitizer);
        this.sanitizerFallback = new DomPurifyAdapter();

        logger.info("✔ Adapters ready");
    }

    // ---------------------------------------------
    // Manager Setup
    // ---------------------------------------------
    private setupManagers() {
        logger.info("🗂 Setting up managers...");

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

        logger.info("✔ Managers ready");
    }

    // ---------------------------------------------
    // PUBLIC APIs
    // ---------------------------------------------
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

    // ---------------------------------------------
    // EXPRESS PIPELINE
    // ---------------------------------------------
    middleware() {
        const chain: any[] = [];

        // JSON parsing (native express)
        chain.push(express.json());
        chain.push(express.urlencoded({ extended: true }));

        // Security middlewares
        if (this.config.enableHelmet) chain.push(helmet());
        if (this.config.enableHPP) chain.push(hpp());
        if (this.config.enableCORS) chain.push(cors());

        // Sanitizer
        if (this.config.enableSanitizer) {
            chain.push(this.sanitizerManager.middleware());
        }

        // Rate Limiter
        if (this.config.enableRateLimiter) {
            chain.push(this.rateLimitManager.middleware());
        }

        // Error Handler
        chain.push(errorHandler);

        return chain;
    }
}
