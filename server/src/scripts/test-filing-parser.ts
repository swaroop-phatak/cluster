import fs from "node:fs";
import path from "node:path";

import { parseForm4Xml } from "../services/filing-parser.service";

const filePath = path.join(
  process.cwd(),
  "tests",
  "fixtures",
  "form4-sample-1-10b5-1.xml"
);

const xml = fs.readFileSync(filePath, "utf-8");

const filing = parseForm4Xml(xml);

console.log(JSON.stringify(filing, null, 2));