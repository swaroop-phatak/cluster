import "dotenv/config";
import { prisma } from "../db/client";
import { calculateClusterScore } from "../services/cluster.service";

async function main() {
  const clusters = await prisma.$queryRaw<
    Array<{
      id: string;
      companyId: string;
      windowStart: Date;
      windowEnd: Date;
      score: number;
    }>
  >`
  SELECT
    id,
    company_id AS "companyId",
    window_start AS "windowStart",
    window_end AS "windowEnd",
    score
  FROM clusters
  WHERE score_breakdown IS NULL
  ORDER BY updated_at ASC;
`;

  console.log(`Found ${clusters.length} clusters missing score breakdown.`);

  for (const cluster of clusters) {
    const rows = await prisma.$queryRaw<
      Array<{
        insider_id: string;
        title: string | null;
        total_value: unknown;
      }>
    >`
      SELECT
        f.insider_id,
        ir.title,
        t.total_value
      FROM transactions t
      JOIN filings f
        ON t.filing_id = f.id
      LEFT JOIN insider_roles ir
        ON ir.insider_id = f.insider_id
       AND ir.company_id = f.company_id
      WHERE f.company_id = ${cluster.companyId}
        AND t.transaction_code = 'P'
        AND t.is_10b5_1 = FALSE
        AND t.is_derivative = FALSE
        AND t.transaction_date >= ${cluster.windowStart}
        AND t.transaction_date <= ${cluster.windowEnd};
    `;

    const insiderCount = new Set(rows.map((row) => row.insider_id)).size;

    const roleDiversity = new Set(
      rows
        .map((row) => row.title)
        .filter((title): title is string => title !== null),
    ).size;

    const totalValue = rows.reduce(
      (sum, row) => sum + Number(row.total_value ?? 0),
      0,
    );

    const scoreResult = calculateClusterScore({
      insiderCount,
      roleDiversity,
      totalValue,
      windowStart: cluster.windowStart,
      windowEnd: cluster.windowEnd,
      windowDays: 30,
    });

    console.log("\nCluster:", cluster.id);
    console.log("Existing score:", cluster.score.toString());
    console.log("Calculated score:", scoreResult.score);
    console.log("Breakdown:", scoreResult.breakdown);

    if (scoreResult.score !== Number(cluster.score)) {
      console.error(
        `SKIPPING ${cluster.id}: calculated score does not match existing score.`,
      );
      continue;
    }

    await prisma.cluster.update({
      where: {
        id: cluster.id,
      },
      data: {
        scoreBreakdown: JSON.parse(JSON.stringify(scoreResult.breakdown)),
      },
    });

    console.log("✓ Breakdown saved.");
  }

  console.log("\nBackfill complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
