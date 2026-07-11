import fs from "node:fs";
import path from "node:path";
import { parseForm4Xml } from "../../src/services/filing-parser.service";

function loadFixture(name: string): string {
  return fs.readFileSync(path.join(__dirname, "..", "fixtures", name), "utf-8");
}

describe("parseForm4Xml", () => {
  it("parses a non-derivative 10b5-1 transaction correctly", () => {
    const xml = loadFixture("form4-sample-1-10b5-1.xml");
    const result = parseForm4Xml(xml);

    expect(result.company.cik).toBe("0001555279");
    expect(result.insider.name).toBe("Knopp Kevin J.");
    expect(result.transactions).toHaveLength(1);

    const transaction = result.transactions[0]!;

    expect(transaction.is10b51).toBe(true);
    expect(transaction.isDerivative).toBe(false);
    expect(transaction.transactionCode).toBe("S");
  });

  it("parses derivative transactions correctly", () => {
    const xml = loadFixture("form4-sample-2-derivative.xml");
    const result = parseForm4Xml(xml);

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions.every((t) => t.isDerivative)).toBe(true);

    const first = result.transactions[0]!;
    const second = result.transactions[1]!;

    expect(first.pricePerShare).toBe(0);
    expect(second.pricePerShare).toBe(0);
  });

  it("parses a plain filing with no 10b5-1 and mixed transaction codes", () => {
    const xml = loadFixture("form4-sample-3-no-10b51.xml");
    const result = parseForm4Xml(xml);

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions.every((t) => t.is10b51 === false)).toBe(true);
    expect(result.transactions.map((t) => t.transactionCode)).toEqual([
      "A",
      "F",
    ]);
  });

  it("parses a multi-transaction filing correctly", () => {
    const xml = loadFixture("form4-sample-4-multi-transaction.xml");
    const result = parseForm4Xml(xml);

    expect(result.transactions).toHaveLength(8);
    expect(result.transactions.every((t) => t.is10b51)).toBe(true);
  });

  it("handles a missing officer title as null, not a crash", () => {
    const xml = loadFixture("form4-sample-5-ten-percent-owner.xml");
    const result = parseForm4Xml(xml);

    expect(result.role.title).toBeNull();
    expect(result.role.isTenPercentOwner).toBe(true);
    expect(result.role.isOfficer).toBe(false);
  });
});