// src/index.ts - MAIN ENTRY POINT
import { HiSecure } from "./core/HiSecure.js";
import { useSecure, secureRoute } from "./core/useSecure.js";

const hiSecure = HiSecure.getInstance();

export { 
    HiSecure,        // Class for advanced usage
    hiSecure,        // Singleton instance
    useSecure,       // Legacy function (deprecated)
    secureRoute      // Route-level security helper
};

export default hiSecure;



