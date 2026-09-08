import { Prisma } from "../generated/prisma/client";
import { prisma } from "../db/client";
import { ConflictError } from "../lib/errors";

export async function createNotificationIfNotExists(
  userId: string,
  clusterId: string,
  channel: "email",
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        clusterId,
        channel,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return null;
    }

    throw error;
  }
}