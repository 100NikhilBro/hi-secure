import { HiSecureConfig } from "../core/config";

export class ValidatorManager {
    private config: HiSecureConfig["validation"];
    private primaryAdapter: any;
    private fallbackAdapter: any;

    constructor(config: HiSecureConfig["validation"], primaryAdapter: any, fallbackAdapter: any) {
        this.config = config;
        this.primaryAdapter = primaryAdapter;
        this.fallbackAdapter = fallbackAdapter;
    }

    validate(schema: any) {
    try {
        return this.primaryAdapter.validate(schema);
    } catch (err) {
        if (!this.fallbackAdapter) throw err;
        console.warn("⚠ Validation failed → using fallback adapter.");
        return this.fallbackAdapter.validate(schema);
    }
}
}
