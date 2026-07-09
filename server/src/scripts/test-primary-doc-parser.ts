import { fetchPrimaryDocumentFilename, buildFilingUrl } from "../external/edgar.client";

async function test() {
  const cik = "1555279";
  const accessionNumber = "0001836523-26-000009";

  const fileName = await fetchPrimaryDocumentFilename(cik, accessionNumber);
  console.log("Filename:", fileName);

  const url = buildFilingUrl(cik, accessionNumber, fileName);
  console.log("URL:", url);
}

test();