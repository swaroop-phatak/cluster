import { prisma } from "../db/client";

interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
}

export async function createUser(data: CreateUserInput) {
  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function incrementRefreshTokenVersion(userId: string) {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshTokenVersion: {
        increment: 1,
      },
    },
  });
}

export async function getNotificationPreferences(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailAlertsEnabled: true,
      minScoreThreshold: true,
    },
  });
}

export async function updateNotificationPreferences(
  userId: string,
  data: {
    emailAlertsEnabled?: boolean;
    minScoreThreshold?: number;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      emailAlertsEnabled: true,
      minScoreThreshold: true,
    },
  });
}