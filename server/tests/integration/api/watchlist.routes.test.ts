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

describe("Watchlist API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.watchlist.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 409 when adding the same company twice", async () => {
    const email = "watchlist-test@example.com";
    const password = "SecurePass123";

    const company = await prisma.company.create({
      data: {
        ticker: "TEST",
        name: "Test Company",
        cik: "0000000001",
      },
    });

    const registerRes = await request(app)
      .post("/api/v1/auth/register")
      .send({
        email,
        password,
        name: "Watchlist Test",
      });

    expect(registerRes.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      });

    expect(loginRes.status).toBe(200);

    const cookies = loginRes.headers["set-cookie"];

    expect(cookies).toBeDefined();

    if (!cookies) {
      throw new Error("Login did not return authentication cookies");
    }

    const firstAdd = await request(app)
      .post("/api/v1/watchlists")
      .set("Cookie", cookies)
      .send({
        companyId: company.id,
      });

    expect(firstAdd.status).toBe(201);
    expect(firstAdd.body.companyId).toBe(company.id);

    const secondAdd = await request(app)
      .post("/api/v1/watchlists")
      .set("Cookie", cookies)
      .send({
        companyId: company.id,
      });

    expect(secondAdd.status).toBe(409);
    expect(secondAdd.body.error.message).toBe("Already watchlisted");
  });
});