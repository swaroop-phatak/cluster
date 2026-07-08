import {fetchRecentForm4Filings} from '../external/edgar.client';

async function testFetchRecentForm4Filings() {
    try {
        const data = await fetchRecentForm4Filings();
        console.log("Fetched data successfully:");
        console.log(data.slice(0, 5)); // Display only the first 5 entries for brevity
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

testFetchRecentForm4Filings();