import { XMLParser } from "fast-xml-parser";

interface ParsedFiling {
  company: { cik: string; name: string; ticker: string };
  insider: { cik: string; name: string };
  role: {
    title: string | null;
    isOfficer: boolean;
    isDirector: boolean;
    isTenPercentOwner: boolean;
  };
  periodOfReport: string;
  transactions: ParsedTransaction[];
}

interface ParsedTransaction {
  securityTitle: string;
  transactionDate: string;
  transactionCode: string;
  shares: number | null;
  pricePerShare: number | null;
  totalValue: number | null;
  sharesOwnedAfter: number | null;
  isDerivative: boolean;
  directOrIndirect: string;
  is10b51: boolean;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  numberParseOptions: {
    leadingZeros: false,
    hex: false,
  },
  isArray: (name) => {
    return [
      "nonDerivativeTransaction",
      "nonDerivativeHolding",
      "derivativeTransaction",
      "derivativeHolding",
      "footnote",
      "reportingOwner",
    ].includes(name);
  },
});

function toBoolean(value: unknown): boolean {
  return value === true || value === 1;
}

function collectFootnoteIds(node: any): string[] {
  const footnoteIds: string[] = [];
  if (!node || typeof node !== "object") {
    return footnoteIds;
  }

  for (const key in node) {
    const value = node[key];

    if (key === "footnoteId" && value?.["@_id"]) {
      footnoteIds.push(value["@_id"]);
    } else if (value && typeof value === "object") {
      footnoteIds.push(...collectFootnoteIds(value));
    }
  }
  return footnoteIds;
}

function isTransactionSubjectTo10b51(
  transaction: any,
  footnotes: Array<{ "@_id": string; "#text": string }>,
  documentLevelFlag: number | boolean | undefined,
): boolean {
  const hasDocumentLevelFlag = toBoolean(documentLevelFlag);

  const footnoteIds = collectFootnoteIds(transaction);

  // NOTE: aff10b5One is a document-level flag, not per-transaction. If a filing has
  // multiple transactions and only some are under a 10b5-1 plan, this will mark all
  // of them as 10b5-1. Accepted as an MVP simplification (see FEATURES.md's
  // "sane defaults" framing) — revisit if false positives become a real problem
  // once real ingested data volume exists.

  for (const footnoteId of footnoteIds) {
    const footnote = footnotes.find((note) => note["@_id"] === footnoteId);

    if (footnote?.["#text"]?.toLowerCase().includes("10b5-1")) {
      return true;
    }
  }

  return hasDocumentLevelFlag;
}

function mapTransaction(
  transaction: any,
  isDerivative: boolean,
  footnotes: Array<{ "@_id": string; "#text": string }>,
  documentLevelFlag: number | boolean | undefined,
): ParsedTransaction {
  const shares =
    transaction.transactionAmounts.transactionShares?.value ?? null;

  const pricePerShare =
    transaction.transactionAmounts.transactionPricePerShare?.value ?? null;

  const explicitTotalValue =
    transaction.transactionAmounts.transactionTotalValue?.value ?? null;

  const totalValue =
    explicitTotalValue !== null
      ? explicitTotalValue
      : shares !== null && pricePerShare !== null
        ? shares * pricePerShare
        : null;

  return {
    securityTitle: transaction.securityTitle.value,
    transactionDate: transaction.transactionDate.value,
    transactionCode: transaction.transactionCoding.transactionCode,

    shares,

    pricePerShare,

    totalValue,

    sharesOwnedAfter:
      transaction.postTransactionAmounts.sharesOwnedFollowingTransaction
        ?.value ??
      transaction.postTransactionAmounts.valueOwnedFollowingTransaction
        ?.value ??
      null,

    directOrIndirect:
      transaction.ownershipNature.directOrIndirectOwnership.value,

    isDerivative,

    is10b51: isTransactionSubjectTo10b51(
      transaction,
      footnotes,
      documentLevelFlag,
    ),
  };
}

export function parseForm4Xml(xml: string): ParsedFiling {
  const parsed = parser.parse(xml);
  const document = parsed.ownershipDocument;

  const company = {
    cik: document.issuer.issuerCik,
    name: document.issuer.issuerName,
    ticker: document.issuer.issuerTradingSymbol,
  };

  const reportingOwners = document.reportingOwner;

  if (reportingOwners.length > 1) {
    console.warn(
      `Filing has ${reportingOwners.length} reporting owners; only the first is being extracted. ` +
        `Additional owners are preserved in raw_payload but not persisted as separate records.`,
    );
  }

  const primaryOwner = reportingOwners[0];

  const insider = {
    cik: primaryOwner.reportingOwnerId.rptOwnerCik,
    name: primaryOwner.reportingOwnerId.rptOwnerName,
  };

  const relationship = primaryOwner.reportingOwnerRelationship;

  const role = {
    title: relationship.officerTitle ?? null,
    isOfficer: toBoolean(relationship.isOfficer),
    isDirector: toBoolean(relationship.isDirector),
    isTenPercentOwner: toBoolean(relationship.isTenPercentOwner),
  };

  const periodOfReport = document.periodOfReport;

  const nonDerivativeTransactions =
    document.nonDerivativeTable?.nonDerivativeTransaction ?? [];

  const derivativeTransactions =
    document.derivativeTable?.derivativeTransaction ?? [];

  const mappedDerivativeTransactions = derivativeTransactions.map(
    (transaction: any) =>
      mapTransaction(
        transaction,
        true,
        document.footnotes?.footnote ?? [],
        document.aff10b5One,
      ),
  );
  const mappedNonDerivativeTransactions = nonDerivativeTransactions.map(
    (transaction: any) =>
      mapTransaction(
        transaction,
        false,
        document.footnotes?.footnote ?? [],
        document.aff10b5One,
      ),
  );

  return {
    company,
    insider,
    role,
    periodOfReport,
    transactions: [
      ...mappedNonDerivativeTransactions,
      ...mappedDerivativeTransactions,
    ],
  };
}
