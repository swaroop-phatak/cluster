// server/src/services/cluster.service.ts
import { redisConnection } from "../cache/redis.client";
import { getClusterFeed } from "../repositories/cluster.repository";
import type { ClusterFilters } from "../types/cluster";

interface ClusterMetrics {
  insiderCount: number;
  roleDiversity: number;
  totalValue: number; 
  windowStart: Date;
  windowEnd: Date;
  windowDays: number; 
}

interface ScoreBreakdown {
  insiderCountScore: number;
  roleDiversityScore: number;
  totalValueScore: number;
  windowTightnessScore: number;
}

export interface ClusterScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

const MAX_SUBSCORE = 25;

function scoreInsiderCount(insiderCount: number): number {
  const CAP = 5; // insiders beyond this stop adding marginal score
  return Math.min(insiderCount, CAP) / CAP * MAX_SUBSCORE;
}

function scoreRoleDiversity(roleDiversity: number): number {
  const CAP = 3; // distinct roles beyond this stop adding marginal score
  return Math.min(roleDiversity, CAP) / CAP * MAX_SUBSCORE;
}

function scoreTotalValue(totalValue: number): number {
  if (totalValue <= 0) return 0;
  const LOG_CAP = Math.log10(10_000_000); // $10M treated as "max meaningful" value
  const raw = Math.log10(totalValue) / LOG_CAP;
  return Math.min(Math.max(raw, 0), 1) * MAX_SUBSCORE;
}

function scoreWindowTightness(
  windowStart: Date,
  windowEnd: Date,
  windowDays: number,
): number {
  const spreadMs = windowEnd.getTime() - windowStart.getTime();
  const spreadDays = spreadMs / (1000 * 60 * 60 * 24);
  const tightness = 1 - Math.min(spreadDays / windowDays, 1);
  return tightness * MAX_SUBSCORE;
}

export function calculateClusterScore(metrics: ClusterMetrics): ClusterScoreResult {
  const insiderCountScore = scoreInsiderCount(metrics.insiderCount);
  const roleDiversityScore = scoreRoleDiversity(metrics.roleDiversity);
  const totalValueScore = scoreTotalValue(metrics.totalValue);
  const windowTightnessScore = scoreWindowTightness(
    metrics.windowStart,
    metrics.windowEnd,
    metrics.windowDays,
  );

  const score = Math.round(
    insiderCountScore + roleDiversityScore + totalValueScore + windowTightnessScore,
  );

  return {
    score,
    breakdown: {
      insiderCountScore: Math.round(insiderCountScore),
      roleDiversityScore: Math.round(roleDiversityScore),
      totalValueScore: Math.round(totalValueScore),
      windowTightnessScore: Math.round(windowTightnessScore),
    },
  };
}

export async function getCachedClusterFeed(filters: ClusterFilters) {
  const cacheKey = `clusters:feed:${JSON.stringify(filters)}`;

  const cached = await redisConnection.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const result = await getClusterFeed(filters);

  await redisConnection.set(
    cacheKey,
    JSON.stringify(result),
    "EX",
    60,
  );

  return result;
}