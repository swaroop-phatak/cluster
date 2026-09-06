import type { NextFunction, Request, Response } from "express";
import { AuthError } from "../../lib/errors";
import {
  generateAccessToken,
  generateRefreshToken,
  loginUser,
  registerUser,
  setAuthCookies,
  verifyRefreshToken,
  clearAuthCookies,
} from "../../services/auth.service";
import { incrementRefreshTokenVersion } from "../../repositories/user.repository";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password, name } = req.body;

    const user = await registerUser(email, password, name);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id, 0);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(
      user.id,
      user.refreshTokenVersion,
    );

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AuthError("Missing refresh token");
    }

    const user = await verifyRefreshToken(refreshToken);

    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(
      user.id,
      user.refreshTokenVersion,
    );

    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      try {
        const user = await verifyRefreshToken(refreshToken);
        await incrementRefreshTokenVersion(user.id);
      } catch {
        // Token is already invalid/revoked.
        // We still clear the cookies.
      }
    }

    clearAuthCookies(res);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}