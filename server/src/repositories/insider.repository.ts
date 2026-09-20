import { prisma } from "../db/client";
import type { Insider } from "../generated/prisma/client";

interface InsiderInput {
  cik: string;
  name: string;
}

export async function upsertInsider(insider: InsiderInput): Promise<Insider> {
  return prisma.insider.upsert({
    where: { cik: insider.cik },
    update: {
      name: insider.name,
    },
    create: {
      cik: insider.cik,
      name: insider.name,
    },
  });
}

export async function getInsiderProfile(insiderId: string) {
  return prisma.insider.findUnique({
    where: { id: insiderId },
    include: {
      roles: {
        include: {
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      filings: {
        include: {
          transactions: true,
        },
        orderBy: {
          filingDate: "desc",
        },
        take: 20,
      },
    },
  });
}
