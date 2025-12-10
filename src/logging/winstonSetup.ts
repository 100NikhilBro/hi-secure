import winston from "winston";

export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Shortcut helpers
export const logInfo = (msg: string, meta: any = {}) => logger.info(msg, meta);
export const logWarn = (msg: string, meta: any = {}) => logger.warn(msg, meta);
export const logError = (msg: string, meta: any = {}) => logger.error(msg, meta);
