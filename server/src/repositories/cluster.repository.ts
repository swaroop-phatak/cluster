import { Prisma, PrismaClient } from "../generated/prisma/client";
import { prisma } from "../db/client";
import type { ClusterFilters } from "../types/cluster";

type ClusterCandidate = {
  id: string;
  company_id: string;
  insider_id: string;
  transaction_date: Date;
  distinct_insiders_in_window: number;
  distinct_roles_in_window: number;
  total_window_value: number;
  window_start: Date;
  window_end: Date;
};

export async function findClusterCandidates(
  prisma: PrismaClient,
  windowDays: number = 30,
  companyId?: string,
) {
  const companyFilter = companyId
    ? Prisma.sql`AND f.company_id = ${companyId}`
    : Prisma.empty;
  return prisma.$queryRaw<ClusterCandidate[]>`
    WITH qualifying_transactions AS (
        SELECT
            t.id,
            t.transaction_date,
            t.shares,
            t.price_per_share,
            t.total_value,
            f.company_id,
            f.insider_id
        FROM transactions t
        JOIN filings f
            ON t.filing_id = f.id
        WHERE
            t.transaction_code = 'P'
            AND t.is_10b5_1 = FALSE
            AND t.is_derivative = FALSE
            ${companyFilter}
    ),

    windowed AS (
        SELECT
            qt.id,
            qt.transaction_date,
            qt.company_id,
            qt.insider_id,

            (
                SELECT COUNT(DISTINCT qt2.insider_id) :: INT
                FROM qualifying_transactions qt2
                WHERE qt2.company_id = qt.company_id
                  AND qt2.transaction_date >= qt.transaction_date - (${windowDays} * INTERVAL '1 day')
                  AND qt2.transaction_date <= qt.transaction_date
            ) AS distinct_insiders_in_window,

            (
                SELECT SUM(qt2.total_value)
                FROM qualifying_transactions qt2
                WHERE qt2.company_id = qt.company_id
                  AND qt2.transaction_date >= qt.transaction_date - (${windowDays} * INTERVAL '1 day')
                  AND qt2.transaction_date <= qt.transaction_date
            ) AS total_window_value,

            (
                SELECT MIN(qt2.transaction_date)
                FROM qualifying_transactions qt2
                WHERE qt2.company_id = qt.company_id
                  AND qt2.transaction_date >= qt.transaction_date - (${windowDays} * INTERVAL '1 day')
                  AND qt2.transaction_date <= qt.transaction_date
            ) AS window_start,

            (
                SELECT MAX(qt2.transaction_date)
                FROM qualifying_transactions qt2
                WHERE qt2.company_id = qt.company_id
                  AND qt2.transaction_date >= qt.transaction_date - (${windowDays} * INTERVAL '1 day')
                  AND qt2.transaction_date <= qt.transaction_date
            ) AS window_end,

            (
                SELECT COUNT(DISTINCT ir.title)::INT
                FROM qualifying_transactions qt2
                JOIN insider_roles ir
                    ON ir.insider_id = qt2.insider_id
                   AND ir.company_id = qt2.company_id
                WHERE qt2.company_id = qt.company_id
                  AND qt2.transaction_date >= qt.transaction_date - (${windowDays} * INTERVAL '1 day')
                  AND qt2.transaction_date <= qt.transaction_date
            ) AS distinct_roles_in_window

        FROM qualifying_transactions qt
    )

    SELECT
        id,
        company_id,
        insider_id,
        transaction_date,
        distinct_insiders_in_window,
        distinct_roles_in_window,
        total_window_value,
        window_start,
        window_end
    FROM windowed
    WHERE distinct_insiders_in_window >= 2
    ORDER BY company_id, transaction_date;
  `;
}

export async function upsertCluster(
  prisma: PrismaClient,
  data: {
    companyId: string;
    windowStart: Date;
    windowEnd: Date;
    insiderCount: number;
    totalValue: Prisma.Decimal;
    score: Prisma.Decimal;
    scoreBreakdown?: Prisma.InputJsonValue;
  },
) {
  return prisma.cluster.upsert({
    where: {
      companyId_windowStart_windowEnd: {
        companyId: data.companyId,
        windowStart: data.windowStart,
        windowEnd: data.windowEnd,
      },
    },
    update: {
      insiderCount: data.insiderCount,
      totalValue: data.totalValue,
      score: data.score,
      ...(data.scoreBreakdown !== undefined && {
        scoreBreakdown: data.scoreBreakdown,
      }),
    },
    create: data,
  });
}

export async function getTransactionsInWindow(
  prisma: PrismaClient,
  companyId: string,
  windowStart: Date,
  windowEnd: Date,
) {
  return prisma.$queryRaw<
    Array<{
      id: string;
      insider_id: string;
      title: string | null;
      total_value: Prisma.Decimal | null;
    }>
  >`
    SELECT t.id, f.insider_id, ir.title, t.total_value
    FROM transactions t
    JOIN filings f ON t.filing_id = f.id
    LEFT JOIN insider_roles ir
    ON ir.insider_id = f.insider_id
   AND ir.company_id = f.company_id
    WHERE f.company_id = ${companyId}
      AND t.transaction_code = 'P'
      AND t.is_10b5_1 = FALSE
      AND t.is_derivative = FALSE
      AND t.transaction_date >= ${windowStart}
      AND t.transaction_date <= ${windowEnd};
  `;
}

export async function getClusterFeed(filters: ClusterFilters) {
  const where = {
    ...(filters.minScore !== undefined && {
      score: { gte: filters.minScore },
    }),

    ...(filters.sector && {
      company: {
        sector: filters.sector,
      },
    }),

    ...(filters.dateFrom && {
      windowStart: { gte: filters.dateFrom },
    }),

    ...(filters.dateTo && {
      windowEnd: { lte: filters.dateTo },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.cluster.findMany({
      where,
      include: {
        company: true,
      },
      orderBy:
        filters.sortBy === "date" ? { windowEnd: "desc" } : { score: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),

    prisma.cluster.count({ where }),
  ]);

  return { data, total };
}

export async function getClusterDetail(clusterId: string) {
  return prisma.cluster.findUnique({
    where: { id: clusterId },
    include: {
      company: true,
      clusterTransactions: {
        include: {
          transaction: {
            include: {
              filing: {
                include: {
                  insider: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
