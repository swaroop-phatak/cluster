import { calculateClusterScore } from "../../src/services/cluster.service";

describe("calculateClusterScore", () => {
  it("is deterministic — same input always produces the same output", () => {
    const input = {
      insiderCount: 3,
      roleDiversity: 2,
      totalValue: 500_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-10"),
      windowDays: 30,
    };
    const result1 = calculateClusterScore(input);
    const result2 = calculateClusterScore(input);
    expect(result1).toEqual(result2);
  });

  it("scores a single insider at the minimum insider-count sub-score", () => {
    const result = calculateClusterScore({
      insiderCount: 1,
      roleDiversity: 1,
      totalValue: 100_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-01"),
      windowDays: 30,
    });
    expect(result.breakdown.insiderCountScore).toBe(5); // 1/5 of the cap
  });

  it("caps insider-count score at 5+ insiders — 5 and 10 score identically", () => {
    const base = {
      roleDiversity: 1,
      totalValue: 100_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-01"),
      windowDays: 30,
    };
    const fiveInsiders = calculateClusterScore({ ...base, insiderCount: 5 });
    const tenInsiders = calculateClusterScore({ ...base, insiderCount: 10 });
    expect(fiveInsiders.breakdown.insiderCountScore).toBe(25);
    expect(tenInsiders.breakdown.insiderCountScore).toBe(25);
  });

  it("gives zero value-score for zero total value", () => {
    const result = calculateClusterScore({
      insiderCount: 2,
      roleDiversity: 1,
      totalValue: 0,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-01"),
      windowDays: 30,
    });
    expect(result.breakdown.totalValueScore).toBe(0);
  });

  it("gives maximum tightness score for a same-day window", () => {
    const result = calculateClusterScore({
      insiderCount: 2,
      roleDiversity: 1,
      totalValue: 100_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-01"),
      windowDays: 30,
    });
    expect(result.breakdown.windowTightnessScore).toBe(25);
  });

  it("gives lower tightness score for a wider window", () => {
    const tight = calculateClusterScore({
      insiderCount: 2,
      roleDiversity: 1,
      totalValue: 100_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-03"),
      windowDays: 30,
    });
    const wide = calculateClusterScore({
      insiderCount: 2,
      roleDiversity: 1,
      totalValue: 100_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-29"),
      windowDays: 30,
    });
    expect(tight.breakdown.windowTightnessScore).toBeGreaterThan(wide.breakdown.windowTightnessScore);
  });

  it("a bigger, tighter, more diverse cluster scores higher than a small, loose, uniform one", () => {
    const strong = calculateClusterScore({
      insiderCount: 5,
      roleDiversity: 3,
      totalValue: 5_000_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-01"),
      windowDays: 30,
    });
    const weak = calculateClusterScore({
      insiderCount: 2,
      roleDiversity: 1,
      totalValue: 50_000,
      windowStart: new Date("2026-06-01"),
      windowEnd: new Date("2026-06-28"),
      windowDays: 30,
    });
    expect(strong.score).toBeGreaterThan(weak.score);
  });
});