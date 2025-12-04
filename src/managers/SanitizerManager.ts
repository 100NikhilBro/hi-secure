import { SanitizeHtmlAdapter } from "../adapters/SanitizeHtmlAdapter";
import { AdapterError } from "../core/errors/AdapterError";
import { SanitizerError } from "../core/errors/SanitizerError";

export class SanitizerManager {
  private primary: SanitizeHtmlAdapter;
  private fallback: any | null;

  constructor(primary: SanitizeHtmlAdapter, fallback: any | null = null) {
    this.primary = primary;
    this.fallback = fallback;
  }

  sanitize(value: string): string {
    try {
      return this.primary.sanitize(value);
    } catch (err) {
      console.warn("Primary sanitizer failed, trying fallback...");
      if (!this.fallback) throw new SanitizerError("Sanitizer failed and no fallback available.");
      try {
        return this.fallback.sanitize(value);
      } catch (e) {
        throw new SanitizerError("Both primary and fallback sanitizers failed.");
      }
    }
  }

  middleware() {
    // return adaptor middleware (primary, with fallback handled inside sanitize())
    return this.primary.middleware();
  }
}
