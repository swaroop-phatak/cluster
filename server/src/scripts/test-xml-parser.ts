import fs from "node:fs";
import path from "node:path";
import {XMLParser} from "fast-xml-parser";

async function parseXmlFile(){
    const filePath = path.join(
    process.cwd(),
    "tests",
    "fixtures",
    "form4-sample-2-derivative.xml"
);

const xmlData = fs.readFileSync(filePath, "utf-8");

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    numberParseOptions: {
        leadingZeros: false,
        hex: false,
    },
    isArray : (name) => {
        return ["nonDerivativeTransaction", "nonDerivativeHolding", "derivativeTransaction", "derivativeHolding", "footnote"].includes(name);
    }
})

const parsed = parser.parse(xmlData);

console.log(JSON.stringify(parsed, null, 2));
}

parseXmlFile()
