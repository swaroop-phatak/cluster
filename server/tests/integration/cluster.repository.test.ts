import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  describe,
} from "@jest/globals";

import { findClusterCandidates } from "../../src/repositories/cluster.repository";

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL as string,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedTransaction(opts: {
  companyId: string;
  insiderId: string;
  accessionSuffix: string;
  date: string;
  code?: string;
  is10b51?: boolean;
  isDerivative?: boolean;
}) {
  const filing = await prisma.filing.create({
    data: {
      accessionNumber: `TEST-ACC-${opts.accessionSuffix}`,
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
      transactionCode: opts.code ?? "P",
      transactionDate: new Date(opts.date),
      shares: 1000,
      pricePerShare: 10,
      isDerivative: opts.isDerivative ?? false,
      is10b51: opts.is10b51 ?? false,
      directOrIndirect: "D",
    },
  });
}

describe("findClusterCandidates()", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {});

  afterEach(async () => {
    await prisma.clusterTransaction.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.filing.deleteMany();
    await prisma.insiderRole.deleteMany();
    await prisma.insider.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  it("detects a genuine cluster", async () => {
    const company = await prisma.company.create({
      data: { cik: "TEST-CLUSTER-1", name: "Cluster Test Co" },
    });
    const insiderA = await prisma.insider.create({
      data: { cik: "TEST-INSIDER-A", name: "Insider A" },
    });
    const insiderB = await prisma.insider.create({
      data: { cik: "TEST-INSIDER-B", name: "Insider B" },
    });

    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "A",
      date: "2026-06-01",
    });

    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "B",
      date: "2026-06-10",
    });

    const results = await findClusterCandidates(prisma, 30);

    const companyResults = results.filter(
      (r: any) => r.company_id === company.id,
    );
    expect(companyResults.length).toBeGreaterThan(0);

    const first = companyResults[0];

    if (!first) {
      throw new Error("Expected cluster candidate");
    }

    expect(first.distinct_insiders_in_window).toBe(2);
  });

  it("does not flag a single insider trading multiple times as a cluster", async () => {
    const company = await prisma.company.create({
      data: { cik: "T2", name: "Solo Co" },
    });
    const insider = await prisma.insider.create({
      data: { cik: "T2-A", name: "Solo Insider" },
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insider.id,
      accessionSuffix: "T2-1",
      date: "2026-06-01",
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insider.id,
      accessionSuffix: "T2-2",
      date: "2026-06-05",
    });

    const results = await findClusterCandidates(prisma, 30);
    expect(
      results.filter((r: any) => r.company_id === company.id),
    ).toHaveLength(0);
  });

  it("does not flag insiders trading outside the window", async () => {
    const company = await prisma.company.create({
      data: { cik: "T3", name: "Wide Gap Co" },
    });
    const insiderA = await prisma.insider.create({
      data: { cik: "T3-A", name: "A" },
    });
    const insiderB = await prisma.insider.create({
      data: { cik: "T3-B", name: "B" },
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "T3-1",
      date: "2026-01-01",
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "T3-2",
      date: "2026-06-01",
    }); // 150+ days later

    const results = await findClusterCandidates(prisma, 30);
    expect(
      results.filter((r: any) => r.company_id === company.id),
    ).toHaveLength(0);
  });

  it("excludes 10b5-1 transactions from qualifying as cluster signal", async () => {
    const company = await prisma.company.create({
      data: { cik: "T4", name: "Plan Co" },
    });
    const insiderA = await prisma.insider.create({
      data: { cik: "T4-A", name: "A" },
    });
    const insiderB = await prisma.insider.create({
      data: { cik: "T4-B", name: "B" },
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "T4-1",
      date: "2026-06-01",
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "T4-2",
      date: "2026-06-05",
      is10b51: true,
    });

    const results = await findClusterCandidates(prisma, 30);
    expect(
      results.filter((r: any) => r.company_id === company.id),
    ).toHaveLength(0);
  });

  it("excludes non-purchase transaction codes", async () => {
    const company = await prisma.company.create({
      data: { cik: "T5", name: "Sale Co" },
    });
    const insiderA = await prisma.insider.create({
      data: { cik: "T5-A", name: "A" },
    });
    const insiderB = await prisma.insider.create({
      data: { cik: "T5-B", name: "B" },
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "T5-1",
      date: "2026-06-01",
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "T5-2",
      date: "2026-06-05",
      code: "S",
    });

    const results = await findClusterCandidates(prisma, 30);
    expect(
      results.filter((r: any) => r.company_id === company.id),
    ).toHaveLength(0);
  });

  it("includes insiders exactly at the window boundary (inclusive)", async () => {
    const company = await prisma.company.create({
      data: { cik: "T6", name: "Boundary Co" },
    });
    const insiderA = await prisma.insider.create({
      data: { cik: "T6-A", name: "A" },
    });
    const insiderB = await prisma.insider.create({
      data: { cik: "T6-B", name: "B" },
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "T6-1",
      date: "2026-06-01",
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "T6-2",
      date: "2026-07-01",
    }); // exactly 30 days later

    const results = await findClusterCandidates(prisma, 30);
    const companyResults = results.filter(
      (r: any) => r.company_id === company.id,
    );
    expect(companyResults.length).toBeGreaterThan(0);
    expect(
      companyResults.some((r: any) => r.distinct_insiders_in_window === 2),
    ).toBe(true);
  });

  it("excludes insiders just outside the window boundary", async () => {
    const company = await prisma.company.create({
      data: { cik: "T7", name: "Just Outside Co" },
    });
    const insiderA = await prisma.insider.create({
      data: { cik: "T7-A", name: "A" },
    });
    const insiderB = await prisma.insider.create({
      data: { cik: "T7-B", name: "B" },
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderA.id,
      accessionSuffix: "T7-1",
      date: "2026-06-01",
    });
    await seedTransaction({
      companyId: company.id,
      insiderId: insiderB.id,
      accessionSuffix: "T7-2",
      date: "2026-07-02",
    }); // 31 days later

    const results = await findClusterCandidates(prisma, 30);
    expect(
      results.filter((r: any) => r.company_id === company.id),
    ).toHaveLength(0);
  });
});
