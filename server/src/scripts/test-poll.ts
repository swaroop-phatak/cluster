import "dotenv/config";

import { ingestionQueue } from "../jobs/queues";

async function main() {
  await ingestionQueue.add(
    "poll-edgar",
    {},
    );
  console.log("✅ poll-edgar job added");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });