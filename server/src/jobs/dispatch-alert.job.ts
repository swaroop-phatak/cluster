import { prisma } from "../db/client";
import { createNotificationIfNotExists } from "../repositories/notification.repository";
import { sendAlertEmail } from "../external/email.client";

export async function dispatchAlertJob(clusterId: string): Promise<void> {
  const cluster = await prisma.cluster.findUnique({
    where: { id: clusterId },
    include: {
      company: true,
    },
  });

  if (!cluster) {
    throw new Error(`Cluster not found: ${clusterId}`);
  }

  const watchlistEntries = await prisma.watchlist.findMany({
    where: {
      companyId: cluster.companyId,
      user: {
        emailAlertsEnabled: true,
        minScoreThreshold: {
          lte: cluster.score.toNumber(),
        },
      },
    },
    include: {
      user: true,
    },
  });

  for (const entry of watchlistEntries) {
    const notification = await createNotificationIfNotExists(
      entry.userId,
      cluster.id,
      "email",
    );

    if (!notification) {
      continue;
    }

    await sendAlertEmail(
      entry.user.email,
      `Cluster Alert: ${cluster.company.name}`,
      `A new insider trading cluster was detected for ${cluster.company.name}.

Cluster score: ${cluster.score.toString()}
Window: ${cluster.windowStart.toISOString()} to ${cluster.windowEnd.toISOString()}

Check the Cluster application for more details.`,
    );

    await prisma.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });
  }
}
