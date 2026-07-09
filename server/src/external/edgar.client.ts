interface EdgarFiling {
  formType: string;
  companyName: string;
  cik: string;
  filingDate: string;
  fileName: string;
  accessionNumber: string;
}

export async function fetchPrimaryDocumentFilename(
  cik: string,
  accessionNumber: string,
): Promise<string> {
  const paddedCik = cik.padStart(10, "0");

  const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Swaroop swaroopphatak27@gmail.com",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch submissions for CIK ${cik}: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();

  const recentFiling = data.filings.recent;

  const filingIndex = recentFiling.accessionNumber.indexOf(accessionNumber);

  if (filingIndex === -1) {
    throw new Error(
      `Accession number ${accessionNumber} not found for CIK ${cik}`,
    );
  }

  const primaryDocument = recentFiling.primaryDocument[filingIndex];

  const fileName = primaryDocument.split("/").pop();

  if (!fileName) {
    throw new Error("Primary document filename is missing");
  }
  return fileName;
}

export function buildFilingUrl(
  cik: string,
  accessionNumber: string,
  fileName: string,
): string {
  const archiveCik = String(Number(cik));
  const accessionWithoutDashes = accessionNumber.replace(/-/g, "");

  return `https://www.sec.gov/Archives/edgar/data/${archiveCik}/${accessionWithoutDashes}/${fileName}`;
}

function getEdgarIndexPath(date = new Date()) {
  date.setDate(date.getDate() - 1); // Move to the previous day

  while (date.getDay() === 0 || date.getDay() === 6) {
    // While it's Saturday or Sunday
    date.setDate(date.getDate() - 1); // Move to the previous day
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Months are zero-based
  const quarter = Math.ceil(month / 3);

  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDay = date.getDate().toString().padStart(2, "0"); // Get the current day and format it as two digits

  const formattedDate = `${year}${formattedMonth}${formattedDay}`;

  return {
    year,
    quarter,
    formattedDate,
  };
}

/**
 * Fetches the most recent completed trading day's Form 4 filing index from EDGAR.
 * Makes a single request per call. If this is ever called in a loop (e.g. to
 * backfill multiple days), a delay must be added between calls to respect
 * SEC's fair-access rate limits (~10 req/sec across sec.gov).
 */

export async function fetchRecentForm4Filings(): Promise<EdgarFiling[]> {
  const { year, quarter, formattedDate } = getEdgarIndexPath();

  const url = `https://www.sec.gov/Archives/edgar/daily-index/${year}/QTR${quarter}/form.${formattedDate}.idx`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Swaroop swaroopphatak27@gmail.com",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch data from ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const text = await response.text();

  const lines = text.split("\n");

  const separatorIndex = lines.findIndex((line) => line.startsWith("-----"));

  const dataLines = lines.slice(separatorIndex + 1);

  const parsedRows = dataLines.map((line) => line.trim().split(/\s{2,}/));

  const form4Rows = parsedRows.filter((row) => row[0] === "4");

  const filings = form4Rows.map((row) => {
    const fileName = row[4]!;

    const accessionNumber = fileName.split("/").pop()!.replace(".txt", "");

    return {
      formType: row[0]!,
      companyName: row[1]!,
      cik: row[2]!,
      filingDate: row[3]!,
      fileName,
      accessionNumber,
    };
  });

  return filings;
}
