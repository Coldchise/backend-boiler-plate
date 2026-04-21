import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { env } from "../config/env";
import { AppError } from "../lib/app-error";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details ?? null,
    });
  }

  if (err instanceof Error) {
    console.error(err);

    return res.status(500).json({
      message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}
