import { PrismaClient } from "../generated/prisma/client";

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

export async function findClusterCandidates(prisma: PrismaClient,
  windowDays: number = 30) {
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