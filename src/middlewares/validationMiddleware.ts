import { ValidatorManager } from "../managers/ValidatorManager";

export function validationMiddleware(schema: any, manager: ValidatorManager) {
    return manager.validate(schema);
}
