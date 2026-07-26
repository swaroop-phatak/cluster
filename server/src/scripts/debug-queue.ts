import "dotenv/config";

import { ingestionQueue } from "../jobs/queues";

async function main() {
  console.log("Waiting:", await ingestionQueue.getWaitingCount());
  console.log("Active:", await ingestionQueue.getActiveCount());
  console.log("Delayed:", await ingestionQueue.getDelayedCount());
  console.log("Completed:", await ingestionQueue.getCompletedCount());
  console.log("Failed:", await ingestionQueue.getFailedCount());

  const waiting = await ingestionQueue.getWaiting();

  console.log("\nWaiting Jobs:");
  for (const job of waiting) {
    console.log(job.id, job.name, job.data);
  }
}

main().finally(() => process.exit());