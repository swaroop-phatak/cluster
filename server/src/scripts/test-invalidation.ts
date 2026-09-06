// server/src/scripts/test-invalidation.ts
import "dotenv/config";
import { prisma } from "../db/client";
import { evaluateClusterJob } from "../jobs/evaluate-cluster.job";

async function main() {
  // pick a real companyId from your DB that already has a cluster —
  // grab one from Prisma Studio's `clusters` table, copy its `companyId`
  const companyId = "f8f4906e-db55-432c-be39-54e22eed9c6d";

  console.log("Running evaluateClusterJob for", companyId);
  await evaluateClusterJob(prisma, companyId);
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => process.exit());