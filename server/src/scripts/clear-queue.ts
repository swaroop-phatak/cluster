import "dotenv/config";

import { ingestionQueue } from "../jobs/queues";

async function main() {
  console.log("Obliterating BullMQ queue...");

  await ingestionQueue.obliterate({ force: true });

  console.log("✅ Queue obliterated successfully.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit());