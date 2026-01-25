import { HiSecure } from "./HiSecure.js";
import { SecureOptions } from "./types/SecureOptions.js";

/**
 * @deprecated Use HiSecure.middleware()
 */
export function useSecure(
  options?: SecureOptions | "api" | "strict" | "public"
) {
  console.warn("useSecure() is deprecated. Use HiSecure.middleware() instead.");
  return HiSecure.middleware(options);
}

/**
 * Legacy route-level security
 */
export function secureRoute(options?: SecureOptions) {
  const chain: any[] = [];

  if (!options) return chain;

  if (options.cors) {
    chain.push(HiSecure.cors());
  }

  if (options.rateLimit) {
    chain.push(
      HiSecure.rateLimit(
        typeof options.rateLimit === "object"
          ? options.rateLimit
          : options.rateLimit === "strict"
          ? "strict"
          : "relaxed"
      )
    );
  }

  if (options.sanitize) {
    chain.push(HiSecure.sanitize());
  }

  if (options.validate) {
    chain.push(HiSecure.validate(options.validate));
  }

  if (options.auth) {
    chain.push(
      HiSecure.auth(
        typeof options.auth === "object" ? options.auth : undefined
      )
    );
  }

  return chain;
}
