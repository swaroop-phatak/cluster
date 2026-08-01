import { findClusterCandidates } from "../repositories/cluster.repository";
import { prisma } from "../db/client";

async function main() {
  const rows = await findClusterCandidates(prisma);

  console.log(rows);

  const first = rows[0];

  if (!first) {
    console.log("No cluster candidates found.");
    return;
  }

  console.log("\n=== TYPES ===");
  console.log(
    "distinct_insiders_in_window:",
    typeof first.distinct_insiders_in_window,
  );
  console.log(
    "distinct_roles_in_window:",
    typeof first.distinct_roles_in_window,
  );
  console.log("total_window_value:", typeof first.total_window_value);
  console.log(first.total_window_value);
  console.log(first.total_window_value.constructor.name);
}

main().catch(console.error);
