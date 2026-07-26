import {
  buildFilingUrl,
  fetchPrimaryDocumentFilename,
} from "../external/edgar.client";
import { Prisma } from "../generated/prisma/client";
import { upsertCompany } from "../repositories/company.repository";
import { upsertFiling } from "../repositories/filing.repository";
import { upsertInsider } from "../repositories/insider.repository";
import { upsertTransactionsForFiling } from "../repositories/transaction.repository";
import { parseForm4Xml } from "../services/filing-parser.service";
import { parseFormDate } from "../utils/date.util";

export interface ParseFilingJobData {
  accessionNumber: string;
  cik: string;
  filingDate: string;
}

export async function processParseFilingJob(
  data: ParseFilingJobData,
): Promise<void> {
  console.log("1. Fetching primary document");
  const primaryDocument = await fetchPrimaryDocumentFilename(
    data.cik,
    data.accessionNumber,
  );

  const filingUrl = buildFilingUrl(
    data.cik,
    data.accessionNumber,
    primaryDocument,
  );
  console.log("2. Downloading XML");
  const response = await fetch(filingUrl, {
    headers: {
      "User-Agent": "Swaroop swaroopphatak27@gmail.com",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch filing for accession number ${data.accessionNumber}: ${response.status} ${response.statusText}`,
    );
  }

  console.log("3. Reading XML");
  const xml = await response.text();

  console.log("4. Parsing XML");
  const parsed = parseForm4Xml(xml);

  console.log("5. Saving company");
  const company = await upsertCompany({
    cik: parsed.company.cik,
    name: parsed.company.name,
    ticker: parsed.company.ticker,
  });

  console.log("6. Saving insider");
  const insider = await upsertInsider({
    cik: parsed.insider.cik,
    name: parsed.insider.name,
  });


  const filingDate = parseFormDate(data.filingDate);

  console.log("7. Saving filing");
  const filing = await upsertFiling({
    accessionNumber: data.accessionNumber,
    formType: "4",
    filingDate: filingDate,
    periodOfReport: parseFormDate(parsed.periodOfReport),
    rawUrl: filingUrl,
    rawPayload: parsed as unknown as Prisma.InputJsonValue,
    companyId: company.id,
    insiderId: insider.id,
  });

  console.log("8. Saving transactions");
  const transactionsForDb = parsed.transactions.map((t) => ({
    ...t,
    transactionDate: parseFormDate(t.transactionDate),
  }));

  await upsertTransactionsForFiling(filing.id, transactionsForDb);

  console.log("9. Job complete");
}
