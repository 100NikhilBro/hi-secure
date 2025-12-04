import { SanitizerManager } from "../managers/SanitizerManager";

export function sanitizerMiddleware(manager: SanitizerManager) {
    return manager.middleware();
}
