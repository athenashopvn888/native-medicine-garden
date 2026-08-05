import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  TV_TICKER_INTERVAL_MS,
  TV_TICKER_SLIDES,
} from "../app/tvTicker.ts";
import { TV_BUNDLE_LABELS } from "../app/tv/tvPricing.ts";

test("regular and sale rows share the approved NMG bundle labels", () => {
  assert.deepEqual(TV_BUNDLE_LABELS, {
    first: "2G = 3G",
    second: "3G = 6G",
  });
});

test("NMG TV has no banner and uses only the approved shared ticker", () => {
  const source = readFileSync(
    new URL("../app/tv/page.tsx", import.meta.url),
    "utf8",
  );
  assert.deepEqual([...TV_TICKER_SLIDES], [
    "HOURS OF OPERATION: OPEN 24 HOURS",
    "ALL SALES ARE FINAL, NO EXCHANGE, NO REFUND",
  ]);
  assert.equal(TV_TICKER_SLIDES.length, 2);
  assert.equal(TV_TICKER_INTERVAL_MS, 5_500);
  assert.match(source, /<VerticalTicker \/>/);
  assert.match(source, /TV_TICKER_SLIDES/);
  assert.match(source, /TV_TICKER_INTERVAL_MS/);
  assert.doesNotMatch(source, /FlowerTvBanner\.webp|menuBanner|menuBannerImage/);
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
