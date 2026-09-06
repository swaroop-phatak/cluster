import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthError } from "../../lib/errors";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.accessToken;

  if (!token) {
    return next(new AuthError("Not authenticated"));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    );

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string"
    ) {
      return next(new AuthError("Not authenticated"));
    }

    req.user = {
      id: decoded.sub,
    };

    next();
  } catch {
    next(new AuthError("Not authenticated"));
  }
}