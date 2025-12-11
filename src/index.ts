// src/index.ts - MAIN ENTRY POINT
import { HiSecure } from "./core/HiSecure.js";
import { useSecure, secureRoute } from "./core/useSecure.js";

// Export the singleton instance for quick usage
const hiSecure = HiSecure.getInstance();

// Export everything
export { 
    HiSecure,        // Class for advanced usage
    hiSecure,        // Singleton instance
    useSecure,       // Legacy function (deprecated)
    secureRoute      // Route-level security helper
};

// Default export is the singleton instance
export default hiSecure;




// // src/index.ts
// import { HiSecure } from "./core/HiSecure.js";
// import { secureRoute } from "./core/useSecure.js"; // Only if kept

// // DON'T auto-init here
// export { 
//     HiSecure,         // Class
//     secureRoute       // Optional sugar API
// };

// // Default export: class itself (NOT instance)
// export default HiSecure;
