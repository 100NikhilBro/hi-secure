import { HiSecure } from "./core/HiSecure";

// Create instance with default config
const hisecure = new HiSecure();

// Initialize internal adapters & managers
hisecure.init();

console.log("HiSecure is Ready to Start");

// Export HiSecure class + instance
export { HiSecure };
export default hisecure;

export * from './external'
