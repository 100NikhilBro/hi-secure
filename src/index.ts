// src/index.ts
import { HiSecure } from "./core/HiSecure";
import { useSecure } from "./core/useSecure";

// Create instance with default configuration
const hisecure = new HiSecure();
hisecure.init();

console.log("🔐 HiSecure initialized");

// Export class, instance, and helper
export { HiSecure, hisecure, useSecure };

// Default export is the instance (common pattern)
export default hisecure;
