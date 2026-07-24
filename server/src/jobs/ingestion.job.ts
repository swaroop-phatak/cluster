import {ingestionQueue} from "./queues";


export async function registerIngestionPolling(){

    await ingestionQueue.add(
        "poll-edgar",
        {},
        {
            repeat: {
                every: 10 * 60 * 1000, // 10 minutes
            },
        },
    );

    console.log("✅ Registered EDGAR polling job");
}