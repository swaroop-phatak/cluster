import type { PrismaClient } from "../generated/prisma/client";
import { Prisma } from "../generated/prisma/client";
import {
  findClusterCandidates,
  getTransactionsInWindow,
  upsertCluster,
} from "../repositories/cluster.repository";
import { calculateClusterScore } from "../services/cluster.service";
import { redisConnection } from "../cache/redis.client";
import { dispatchAlertJob } from "./dispatch-alert.job";
const ALERT_SCORE_THRESHOLD = 70;

interface Interval {
  start: Date;
  end: Date;
}

function mergeOverlappingWindows(
  candidates: Awaited<ReturnType<typeof findClusterCandidates>>,
): Interval[] {
  const sorted = [...candidates].sort(
    (a, b) => a.window_start.getTime() - b.window_start.getTime(),
  );

  const merged: Interval[] = [];

  for (const candidate of sorted) {
    const last = merged[merged.length - 1];
    if (last && candidate.window_start.getTime() <= last.end.getTime()) {
      // overlaps (or touches) the last merged window — extend it
      last.end = new Date(
        Math.max(last.end.getTime(), candidate.window_end.getTime()),
      );
    } else {
      merged.push({ start: candidate.window_start, end: candidate.window_end });
    }
  }

  return merged;
}

export async function evaluateClusterJob(
  prisma: PrismaClient,
  companyId: string,
): Promise<void> {
  console.log("Evaluating clusters for", companyId);
  const candidates = await findClusterCandidates(prisma, 30, companyId);

  if (candidates.length === 0) {
    return; // no qualifying clusters for this company right now
  }
  const windows = mergeOverlappingWindows(candidates);

  for (const window of windows) {
    const rows = await getTransactionsInWindow(
      prisma,
      companyId,
      window.start,
      window.end,
    );

    const insiderCount = new Set(rows.map((r) => r.insider_id)).size;

    const roleDiversity = new Set(
      rows
        .map((r) => r.title)
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
      windowStart: window.start,
      windowEnd: window.end,
      windowDays: 30,
    });

    const cluster = await upsertCluster(prisma, {
      companyId,
      windowStart: window.start,
      windowEnd: window.end,
      insiderCount,
      totalValue: new Prisma.Decimal(totalValue),
      score: new Prisma.Decimal(scoreResult.score),
    });

    if (scoreResult.score >= ALERT_SCORE_THRESHOLD) {
  await dispatchAlertJob(cluster.id);
}

    const keys = await redisConnection.keys("clusters:feed:*");

    if (keys.length) {
      await redisConnection.del(...keys);
    }
    
    await prisma.clusterTransaction.createMany({
      data: rows.map((row) => ({
        clusterId: cluster.id,
        transactionId: row.id,
      })),
      skipDuplicates: true,
    });
  }
}
