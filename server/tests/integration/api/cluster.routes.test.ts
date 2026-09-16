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
import { PrismaClient, Prisma } from "../../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import app from "../../../src/app";

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL as string,
});

const prisma = new PrismaClient({
  adapter,
});

describe("Cluster API", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.cluster.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("filters clusters by score and sector and paginates results", async () => {
    const techCompany = await prisma.company.create({
      data: {
        cik: "0000000001",
        ticker: "TECH",
        name: "Tech Company",
        sector: "Technology",
      },
    });

    const financeCompany = await prisma.company.create({
      data: {
        cik: "0000000002",
        ticker: "FIN",
        name: "Finance Company",
        sector: "Financials",
      },
    });

    await prisma.cluster.createMany({
      data: [
        {
          companyId: techCompany.id,
          windowStart: new Date("2026-08-01"),
          windowEnd: new Date("2026-08-02"),
          insiderCount: 3,
          totalValue: new Prisma.Decimal("500000"),
          score: new Prisma.Decimal("90"),
        },
        {
          companyId: techCompany.id,
          windowStart: new Date("2026-08-05"),
          windowEnd: new Date("2026-08-06"),
          insiderCount: 2,
          totalValue: new Prisma.Decimal("250000"),
          score: new Prisma.Decimal("70"),
        },
        {
          companyId: financeCompany.id,
          windowStart: new Date("2026-08-10"),
          windowEnd: new Date("2026-08-11"),
          insiderCount: 4,
          totalValue: new Prisma.Decimal("750000"),
          score: new Prisma.Decimal("85"),
        },
      ],
    });

    const response = await request(app)
      .get("/api/v1/clusters")
      .query({
        minScore: 80,
        sector: "Technology",
        page: 1,
        pageSize: 1,
        sortBy: "score",
      });

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].score).toBe("90");
    expect(response.body.data[0].company.sector).toBe("Technology");

  });
});