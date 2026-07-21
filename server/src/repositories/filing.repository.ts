import { prisma } from "../db/client";
import type { Filing, Prisma } from "../generated/prisma/client";

interface FilingInput {
  accessionNumber: string;
  formType: string;
  filingDate: Date;
  periodOfReport: Date;
  rawUrl: string;
  rawPayload: Prisma.InputJsonValue;
  companyId: string;
  insiderId: string;
}

export async function upsertFiling(filing: FilingInput): Promise<Filing> {
  return prisma.filing.upsert({
    where: { accessionNumber: filing.accessionNumber },
    update: { rawPayload: filing.rawPayload },
    create: {
      accessionNumber: filing.accessionNumber,
      formType: filing.formType,
      filingDate: filing.filingDate,
      periodOfReport: filing.periodOfReport,
      rawUrl: filing.rawUrl,
      rawPayload: filing.rawPayload,
      companyId: filing.companyId,
      insiderId: filing.insiderId,
    },
  });
}
