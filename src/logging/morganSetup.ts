// // import morgan from "morgan";

// // export const requestLogger = morgan("combined");




// import morgan from "morgan";
// import { logger } from "./winstonSetup";

// export const requestLogger = morgan(
//     ":method :url :status :response-time ms",
//     {
//         stream: {
//             write: (message) => {
//                 logger.http(message.trim());
//             }
//         }
//     }
// );





import morgan from "morgan";
import { logger } from "./winstonSetup";

export const requestLogger = morgan(
    ":method :url :status :response-time ms",
    {
        stream: {
            write: (message) => {
                logger.http(message.trim());
            }
        }
    }
);
