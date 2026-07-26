import "dotenv/config";

import { ingestionQueue } from "../jobs/queues";

async function main() {
  await ingestionQueue.add("parse-filing", {
    accessionNumber: "0001104659-26-086489",
    cik: "1889539",
    filingDate: "2026-07-24",
  });

  await ingestionQueue.add("parse-filing", {
    accessionNumber: "0000950103-26-011156",
    cik: "1535527",
    filingDate: "2026-07-24",
  });

  console.log("✅ Test parse-filing jobs queued.");
}

main()
  .catch(console.error)
  .finally(() => process.exit());