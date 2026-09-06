import bcrypt from "bcrypt";
import type { Response } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  createUser,
  findUserByEmail,
  findUserById
} from "../repositories/user.repository";
import { AuthError, ConflictError } from "../lib/errors";
import jwt from "jsonwebtoken";

const BCRYPT_COST = 12;

export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  try {
    const user = await createUser({
      email,
      passwordHash,
      name,
    });

    const { passwordHash: _, ...safeUser } = user;

    return safeUser;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("Email already registered");
    }

    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AuthError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password");
  }

  const { passwordHash: _, ...safeUser } = user;

  return safeUser;
}

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET as string,
    {
      expiresIn: "15m",
    },
  );
}

export function generateRefreshToken(
  userId: string,
  tokenVersion: number,
): string {
  return jwt.sign(
    {
      sub: userId,
      version: tokenVersion,
    },
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
    },
  );
}

export async function verifyRefreshToken(token: string) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string,
    );

    if (typeof decoded === "string") {
      throw new AuthError("Invalid refresh token");
    }

    const userId = decoded.sub;
    const tokenVersion = decoded.version;

    if (
      typeof userId !== "string" ||
      typeof tokenVersion !== "number"
    ) {
      throw new AuthError("Invalid refresh token");
    }

    const user = await findUserById(userId);

    if (!user) {
      throw new AuthError("Invalid refresh token");
    }

    if (tokenVersion !== user.refreshTokenVersion) {
      throw new AuthError("Invalid refresh token");
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError("Invalid refresh token");
  }
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
}