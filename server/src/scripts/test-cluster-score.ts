import { calculateClusterScore } from "../services/cluster.service";

const result = calculateClusterScore({
  insiderCount: 6,
  roleDiversity: 3,
  totalValue: 6_279_988,
  windowStart: new Date("2026-07-22"),
  windowEnd: new Date("2026-07-22"),
  windowDays: 30,
});

console.log(result);