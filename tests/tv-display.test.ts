import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TV_BUNDLE_LABELS } from "../app/tv/tvPricing.ts";

test("regular and sale rows share the approved NMG bundle labels", () => {
  assert.deepEqual(TV_BUNDLE_LABELS, {
    first: "2G = 3G",
    second: "3G = 6G",
  });
});

test("NMG TV ticker no longer includes Play Games", () => {
  const source = readFileSync(
    new URL("../app/tv/page.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /Play Games/i);
  assert.doesNotMatch(source, /nativemedicinecannabis\.com\/games/i);
  assert.match(source, /<VerticalTicker \/>/);
  assert.match(source, /FlowerTvBanner\.webp/);
  assert.match(source, /Native Medicine Garden Flower TV Menu/);
});

test("NMG TV sale prices render regular price first with semantic strike-through", () => {
  const source = readFileSync(
    new URL("../app/tv/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<del className=\{styles\.oldPrice\}>\$\{pp\.regular\}<\/del>/);
  assert.match(source, /<b className=\{`\$\{styles\.salePrice\}/);
});

test("NMG TV uses the ADC current-menu Add Ons treatment", () => {
  const source = readFileSync(
    new URL("../app/tv/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /<div className=\{styles\.effectIcons\}>CURRENT MENU ITEM<\/div>/);
});
