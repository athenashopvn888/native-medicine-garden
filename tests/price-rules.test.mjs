import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("tier ranges use sale price per gram and source THC only", () => {
  const source = read("app/lib/tierPriceRanges.ts");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const compiled = { exports: {} };
  new Function("module", "exports", output)(compiled, compiled.exports);
  const ranges = compiled.exports;
  const value = ranges.storeTierRange([{ tier: "EXOTIC", thc: "35-39%", price3g: { regular: 42, sale: 36 }, price28g: { regular: 196, sale: null } }], "EXOTIC");
  assert.equal(ranges.tierRangeText(value), "From $7 to $12 a gram · THC about 35 to 39%");
  assert.equal(ranges.tierRangeText(ranges.storeTierRange([], "EXOTIC")), null);
});

test("price rules, labels, FAQ schema source, and chat greeting are wired", () => {
  const home = read("app/HomePageClient.tsx");
  const tier = read("app/[tier]/page.tsx");
  const delivery = read("app/delivery/DeliveryContent.tsx");
  const faq = read("app/faq/page.tsx");
  const chat = read("app/delivery/NativeMedicineWebChat.tsx");
  assert.match(home, /IN-STORE PRICES ONLY\./);
  assert.match(tier, /storeTierRange\(flowers/);
  assert.match(delivery, /DELIVERY PRICES ONLY\./);
  assert.match(delivery, /deliveryTierRanges\(products\)/);
  assert.match(faq, /Can I get the store price on a delivery order\?/);
  assert.match(faq, /FAQPage/);
  assert.match(chat, /Delivery orders are charged these prices, not in-store prices\./);
});

