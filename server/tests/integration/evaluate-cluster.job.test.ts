// server/tests/integration/evaluate-cluster.job.test.ts
import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  describe,
  it,
  expect,
} from "@jest/globals";

import { evaluateClusterJob } from "../../src/jobs/evaluate-cluster.job";

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function seedTransaction(opts: {
  companyId: string;
  insiderId: string;
  accessionSuffix: string;
  date: string;
}) {
  const filing = await prisma.filing.create({
    data: {
      accessionNumber: `TEST-EVAL-${opts.accessionSuffix}`,
      formType: "4",
      filingDate: new Date(opts.date),
      periodOfReport: new Date(opts.date),
      rawUrl: `https://example.com/${opts.accessionSuffix}`,
      rawPayload: {},
      companyId: opts.companyId,
      insiderId: opts.insiderId,
    },
  });

  await prisma.transaction.create({
    data: {
      filingId: filing.id,
      transactionCode: "P",
      transactionDate: new Date(opts.date),
      shares: 1000,
      pricePerShare: 10,
      isDerivative: false,
      is10b51: false,
      directOrIndirect: "D",
    },
  });
}

describe("evaluateClusterJob()", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {});

  afterEach(async () => {
    await prisma.clusterTransaction.deleteMany();
    await prisma.cluster.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.filing.deleteMany();
    await prisma.insiderRole.deleteMany();
    await prisma.insider.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("merges overlapping multi-day windows into a single cluster", async () => {
    const company = await prisma.company.create({
      data: {
        cik: "EVAL-1",
        name: "Multi-Day Co",
      },
    });

    const insiderA = await prisma.insider.create({
      data: {
        cik: "EVAL-1-A",
        name: "Insider A",
      },
    });

    const insiderB = await prisma.insider.create({
      data: {
        cik: "EVAL-1-B",
        name: "Insider B",
      },
    });

    const insiderC = await prisma.insider.create({
      data: {
        cik: "EVAL-1-C",
        name: "Insider C",
      },
    });

    await prisma.insiderRole.createMany({
      data: [
        {
          insiderId: insiderA.id,
          companyId: company.id,
          title: "CEO",
          isOfficer: true,
          isDirector: false,
          isTenPercentOwner: false,
        },
        {
          insiderId: insiderB.id,
          companyId: company.id,
          title: "CFO",
          isOfficer: true,
          isDirector: false,
          isTenPercentOwner: false,
        },
        {
          insiderId: insiderC.id,
          companyId: company.id,
          title: "Director",
          isOfficer: false,
          isDirector: true,
          isTenPercentOwner: false,
        },
      ],
    });

    // Day 1, Day 15, Day 20 — all should merge into one cluster
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "1",
      date: "2026-06-01",
    });

    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "2",
      date: "2026-06-15",
    });

    await seedTransaction({
      companyId: company.id,
      insiderId: insiderC.id,
      accessionSuffix: "3",
      date: "2026-06-20",
    });

    await evaluateClusterJob(prisma, company.id);

    const clusters = await prisma.cluster.findMany({
      where: {
        companyId: company.id,
      },
    });

    expect(clusters).toHaveLength(1);

    const cluster = clusters[0];

    if (!cluster) {
      throw new Error("Expected one cluster");
    }

    expect(cluster.insiderCount).toBe(3);

    const links = await prisma.clusterTransaction.findMany({
      where: {
        clusterId: cluster.id,
      },
    });

    expect(links).toHaveLength(3);
  });
});