import { Request, Response, NextFunction } from "express";
import { logger } from "../logging";
import { AdapterError } from "../core/errors/AdapterError";
import { ValidationError } from "../core/errors/ValidationError";
import { SanitizerError } from "../core/errors/SanitizerError";
import { SecurityError } from "../core/errors/SecurityError";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    // Normalize unknown errors
    const errorMessage =
        typeof err === "string"
            ? err
            : err?.message || "Unknown error occurred";

    const errorStack =
        err instanceof Error && err.stack
            ? err.stack.split("\n").slice(0, 2).join(" | ")
            : undefined;

    // Log error centrally
    logger.error("❌ HiSecure Error Captured", {
        message: errorMessage,
        path: req.path,
        method: req.method,
        stack: errorStack,
        raw: err
    });

    // ------------------------------
    // CLASSIFIED ERROR RESPONSES
    // ------------------------------

    if (err instanceof ValidationError) {
        return res.status(400).json({
            success: false,
            error: "VALIDATION_ERROR",
            message: errorMessage
        });
    }

    if (err instanceof SanitizerError) {
        return res.status(400).json({
            success: false,
            error: "SANITIZER_ERROR",
            message: errorMessage
        });
    }

    if (err instanceof AdapterError) {
        return res.status(500).json({
            success: false,
            error: "ADAPTER_ERROR",
            message: errorMessage
        });
    }

    if (err instanceof SecurityError) {
        return res.status(500).json({
            success: false,
            error: "SECURITY_ERROR",
            message: errorMessage
        });
    }

    // ------------------------------
    // UNEXPECTED ERROR
    // ------------------------------
    return res.status(500).json({
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred in HiSecure middleware."
    });
}
