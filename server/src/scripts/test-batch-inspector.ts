import { fetchRecentForm4Filings } from "../external/edgar.client";
import {
  fetchPrimaryDocumentFilename,
  buildFilingUrl,
} from "../external/edgar.client";
import { parseForm4Xml } from "../services/filing-parser.service";

async function inspectRecentFilings() {
  const filings = await fetchRecentForm4Filings();
  const recentFilings = filings.slice(0, 10); 

  for (const filing of recentFilings) {
    try {
      const fileName = await fetchPrimaryDocumentFilename(
        filing.cik,
        filing.accessionNumber,
      );
      const url = buildFilingUrl(filing.cik, filing.accessionNumber, fileName);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Swaroop swaroopphatak27@gmail.com",
        },
      });

      if (!response.ok) {
        console.error(
          `Failed to fetch document for CIK ${filing.cik} and Accession Number ${filing.accessionNumber}: ${response.status} ${response.statusText}`,
        );
        continue;
      }

      const xml = await response.text();
      const parsedFiling = parseForm4Xml(xml);

      if (
        parsedFiling.role.isTenPercentOwner &&
        !parsedFiling.role.isOfficer &&
        !parsedFiling.role.isDirector
      ) {
        console.log("FOUND CANDIDATE:", {
          accessionNumber: filing.accessionNumber,
          company: parsedFiling.company.name,
          role: parsedFiling.role,
          url,
        });
      }
    } catch (error) {
      console.error(
        `Error processing filing for CIK ${filing.cik} and Accession Number ${filing.accessionNumber}:`,
        error,
      );
    }
  }
}

inspectRecentFilings();
