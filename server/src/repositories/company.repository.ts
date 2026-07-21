import { prisma } from "../db/client";
import type { Company } from "../generated/prisma/client";

interface CompanyInput {
  cik: string;
  name: string;
  ticker: string;
}

export async function upsertCompany(company: CompanyInput): Promise<Company> {
  return prisma.company.upsert({
    where: { cik: company.cik },
    update: {
      name: company.name,
      ticker: company.ticker,
    },
    create: {
      cik: company.cik,
      name: company.name,
      ticker: company.ticker,
    },
  });
}
