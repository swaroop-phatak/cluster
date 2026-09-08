// server/tests/unit/auth.service.test.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../src/services/auth.service";
import * as userRepository from "../../src/repositories/user.repository";
import { AuthError, ConflictError } from "../../src/lib/errors";
import { Prisma } from "../../src/generated/prisma/client";

jest.mock("../../src/repositories/user.repository");

const mockedRepo = userRepository as jest.Mocked<typeof userRepository>;

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

beforeEach(() => {
  jest.clearAllMocks();
});

const fakeUser = {
  id: "user-1",
  email: "test@example.com",
  passwordHash: "hashed",
  name: "Test User",
  role: "user" as const,
  refreshTokenVersion: 0,
  createdAt: new Date(),
  emailAlertsEnabled: true,
  minScoreThreshold: 50,
};

describe("registerUser", () => {
  it("hashes the password and creates a user", async () => {
    mockedRepo.createUser.mockResolvedValue(fakeUser);

    const result = await registerUser("Test@Example.com", "SecurePass123", "Test User");

    expect(mockedRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "Test@Example.com", name: "Test User" }),
    );
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("throws ConflictError when email already exists", async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "test",
    });
    mockedRepo.createUser.mockRejectedValue(prismaError);

    await expect(registerUser("dup@example.com", "SecurePass123", "Dup")).rejects.toThrow(
      ConflictError,
    );
  });
});

describe("loginUser", () => {
  it("throws AuthError when user does not exist", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(null);

    await expect(loginUser("nobody@example.com", "whatever")).rejects.toThrow(AuthError);
  });

  it("throws AuthError when password does not match", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    await expect(loginUser(fakeUser.email, "wrongpass")).rejects.toThrow(AuthError);
  });

  it("returns the user (without passwordHash) on success", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const result = await loginUser(fakeUser.email, "correctpass");

    expect(result.id).toBe(fakeUser.id);
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("gives an identical error for both 'no user' and 'wrong password' cases", async () => {
    mockedRepo.findUserByEmail.mockResolvedValue(null);
    let noUserError: unknown;
    try {
      await loginUser("nobody@example.com", "x");
    } catch (e) {
      noUserError = e;
    }

    mockedRepo.findUserByEmail.mockResolvedValue(fakeUser);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);
    let wrongPasswordError: unknown;
    try {
      await loginUser(fakeUser.email, "wrong");
    } catch (e) {
      wrongPasswordError = e;
    }

    expect((noUserError as AuthError).message).toBe((wrongPasswordError as AuthError).message);
  });
});

describe("token generation and verification", () => {
  it("generates a verifiable access token", () => {
    const token = generateAccessToken("user-1");
    const decoded = jwt.verify(token, "test-access-secret");
    expect(typeof decoded).not.toBe("string");
  });

  it("verifyRefreshToken succeeds when the version matches", async () => {
    const token = generateRefreshToken("user-1", 0);
    mockedRepo.findUserById.mockResolvedValue(fakeUser);

    const user = await verifyRefreshToken(token);
    expect(user.id).toBe("user-1");
  });

  it("verifyRefreshToken rejects a revoked (version-mismatched) token", async () => {
    const token = generateRefreshToken("user-1", 0);
    mockedRepo.findUserById.mockResolvedValue({ ...fakeUser, refreshTokenVersion: 1 });

    await expect(verifyRefreshToken(token)).rejects.toThrow(AuthError);
  });
});