import { prisma } from "../db/client";
import { Prisma } from "../generated/prisma/client";

interface TransactionInput {
  transactionCode: string;
  transactionDate: Date;
  shares: number;
  pricePerShare: number | null;
  sharesOwnedAfter: number;
  totalValue: number | null;
  isDerivative: boolean;
  is10b51: boolean;
  directOrIndirect: string;
}

export async function upsertTransactionsForFiling(
  filingId: string,
  transactions: TransactionInput[],
): Promise<void> {
  await prisma.$transaction([
    prisma.transaction.deleteMany({
      where: { filingId },
    }),

    prisma.transaction.createMany({
      data: transactions.map((transaction) => ({
        filingId,
        transactionCode: transaction.transactionCode,
        transactionDate: transaction.transactionDate,
        shares: new Prisma.Decimal(transaction.shares),
        pricePerShare:
          transaction.pricePerShare !== null
            ? new Prisma.Decimal(transaction.pricePerShare)
            : null,
        sharesOwnedAfter: new Prisma.Decimal(transaction.sharesOwnedAfter),
        totalValue:
          transaction.totalValue !== null
            ? new Prisma.Decimal(transaction.totalValue)
            : null,

        isDerivative: transaction.isDerivative,
        is10b51: transaction.is10b51,
        directOrIndirect: transaction.directOrIndirect,
      })),
    }),
  ]);
}
