import "dotenv/config";

import { Worker } from "bullmq";

import { redisConnection } from "./cache/redis.client";
import { ingestionQueue } from "./jobs/queues";
import { registerIngestionPolling } from "./jobs/ingestion.job";
import { fetchRecentForm4Filings } from "./external/edgar.client";
import { filingExists } from "./repositories/filing.repository";
import { processParseFilingJob } from "./jobs/parse-filing.job";

const worker = new Worker(
  "ingestion",
  async (job) => {
    switch (job.name) {
      case "poll-edgar": {
        console.log("Polling EDGAR...");

        const filings = await fetchRecentForm4Filings();

        // console.log(`Found ${filings.length} filings`);

        let skipped = 0;
        let queued = 0;

        for (const filing of filings) {
          const exists = await filingExists(filing.accessionNumber);

          if (exists) {
            skipped++;
            continue;
          }

          queued++;

          await ingestionQueue.add(
            "parse-filing",
            {
              accessionNumber: filing.accessionNumber,
              cik: filing.cik,
              filingDate: filing.filingDate,
            },
            {
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 5000,
              },
            },
          );
        }
        console.log({
          found: filings.length,
          skipped,
          queued,
        });
        break;
      }

      case "parse-filing": {
        console.log("Received parse-filing job");
        console.log("Job data:", job.data);

        try {
          await processParseFilingJob(job.data);
          console.log(`Finished ${job.data.accessionNumber}`);
        } catch (err) {
          console.error(err);
          throw err;
        }

        break;
      }
      default:
        console.log(`Unknown job type: ${job.name}`);
    }
  },
  { connection: redisConnection },
);

async function main() {
  await registerIngestionPolling();
}

main()
  .then(() => console.log("🚀 Ingestion worker started"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
