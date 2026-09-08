import "dotenv/config";
import { prisma } from "../db/client";
import { dispatchAlertJob } from "../jobs/dispatch-alert.job";

async function main() {
  // Find any real cluster.
  const cluster = await prisma.cluster.findFirst({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      company: true,
    },
  });

  if (!cluster) {
    throw new Error("No clusters found in database");
  }

  // Find any user who has email alerts enabled.
  const user = await prisma.user.findFirst({
    where: {
      emailAlertsEnabled: true,
    },
  });

  if (!user) {
    throw new Error("No user with email alerts enabled found");
  }

  console.log("User:", user.email);
  console.log("Company:", cluster.company.name);
  console.log("Cluster:", cluster.id);

  // Make sure this user watches this company.
  const existingWatchlist = await prisma.watchlist.findUnique({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: cluster.companyId,
      },
    },
  });

  if (!existingWatchlist) {
    await prisma.watchlist.create({
      data: {
        userId: user.id,
        companyId: cluster.companyId,
      },
    });

    console.log("Created temporary watchlist entry.");
  } else {
    console.log("Watchlist entry already exists.");
  }

  // Now run the real dispatch job.
  await dispatchAlertJob(cluster.id);

  console.log("Dispatch complete.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });