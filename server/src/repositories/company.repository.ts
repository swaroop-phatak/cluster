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

export async function searchCompanies(query: string, limit: number) {
  return prisma.company.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { ticker: { contains: query, mode: "insensitive" } },
      ],
    },
    take: limit,
  });
}

export async function getCompanyDashboard(companyId: string) {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      filings: {
        include: {
          transactions: true,
          insider: true,
        },
        orderBy: { filingDate: "desc" },
        take: 20,
      },
      clusters: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}
