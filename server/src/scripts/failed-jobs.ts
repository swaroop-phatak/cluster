import { ingestionQueue } from "../jobs/queues";

async function inspectFailedJobs() {
  const failed = await ingestionQueue.getFailed();
  for (const job of failed) {
    console.log({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
    });
  }
}

inspectFailedJobs();