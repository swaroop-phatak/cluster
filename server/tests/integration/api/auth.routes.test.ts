import "dotenv/config";
import request from "supertest";
import {
  beforeAll,
  afterEach,
  afterAll,
  describe,
  expect,
  it,
} from "@jest/globals";
import { PrismaClient } from "../../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import app from "../../../src/app";

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL as string,
});

const prisma = new PrismaClient({
  adapter,
});

describe("Auth API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers, logs in, and accesses /me", async () => {
    const email = "roundtrip@example.com";
    const password = "SecurePass123";

    const registerRes = await request(app).post("/api/v1/auth/register").send({
      email,
      password,
      name: "Round Trip",
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.email).toBe(email);

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email,
      password,
    });

    expect(loginRes.status).toBe(200);

    const cookies = loginRes.headers["set-cookie"];

    expect(cookies).toBeDefined();

    if (!cookies) {
      throw new Error("Login did not return authentication cookies");
    }

    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(email);
    expect(meRes.body.user.name).toBe("Round Trip");
    expect(meRes.body.user.passwordHash).toBeUndefined();
  });
});
