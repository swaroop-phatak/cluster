import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/errors";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: "details" in error ? error.details : [],
      },
    });
  }

  req.log?.error(error);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
      details: [],
    },
  });
}