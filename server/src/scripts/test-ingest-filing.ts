import { parseForm4Xml } from "../services/filing-parser.service";
import { upsertCompany } from "../repositories/company.repository";
import { upsertFiling } from "../repositories/filing.repository";
import { upsertInsider } from "../repositories/insider.repository";
import { upsertTransactionsForFiling } from "../repositories/transaction.repository";
import fs from "node:fs/promises";
import path from "node:path";
import { Prisma } from "../generated/prisma/client";

async function main() {
  const filePath = path.join(
    process.cwd(),
    "tests",
    "fixtures",
    "form4-sample-4-multi-transaction.xml",
  );

  const xml = await fs.readFile(filePath, "utf-8");

  const parsed = parseForm4Xml(xml);

  const company = await upsertCompany({
    cik: parsed.company.cik,
    name: parsed.company.name,
    ticker: parsed.company.ticker,
  });

  console.log("Upserted Company:", company);

  const insider = await upsertInsider({
    cik: parsed.insider.cik,
    name: parsed.insider.name,
  });

  console.log("Upserted Insider:", insider);

  const periodOfReport = new Date(parsed.periodOfReport);

  const accessionNumber = "000110465926081597";
  const rawUrl =
    "https://www.sec.gov/Archives/edgar/data/1659494/000110465926081597/tm2620038-1_4seq1.xml";
  const filingDate = new Date("2026-07-08");

  const filing = await upsertFiling({
    accessionNumber,
    formType: "4",
    filingDate,
    periodOfReport,
    rawUrl,
    rawPayload: parsed as unknown as Prisma.InputJsonValue,
    companyId: company.id,
    insiderId: insider.id,
  });

  console.log("Upserted Filing:", filing);

  const transactionsForDb = parsed.transactions.map((t) => ({
    ...t,
    transactionDate: new Date(t.transactionDate),
  }));

  await upsertTransactionsForFiling(filing.id, transactionsForDb);

  console.log("Transactions upserted:", parsed.transactions.length);
}

main();
