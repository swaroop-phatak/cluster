import { Prisma } from "../generated/prisma/client";
import { prisma } from "../db/client";
import { NotFoundError, ConflictError } from "../lib/errors";

export async function getWatchlist(userId: string) {
  return prisma.watchlist.findMany({
    where: { userId },
    include: { company: true },
  });
}

export async function addToWatchlist(
  userId: string,
  companyId: string,
) {
  const companyExists = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!companyExists) {
    throw new NotFoundError("Company not found");
  }

  try {
    return await prisma.watchlist.create({
      data: {
        userId,
        companyId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("Already watchlisted");
    }

    throw error;
  }
}

export async function removeFromWatchlist(
  userId: string,
  companyId: string,
) {
  const result = await prisma.watchlist.deleteMany({
    where: {
      userId,
      companyId,
    },
  });

  if (result.count === 0) {
    throw new NotFoundError("Not found");
  }
}