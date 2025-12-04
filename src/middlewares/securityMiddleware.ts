import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";

export function securityMiddleware() {
    return [
        helmet(),
        hpp(),
        cors()
    ];
}
