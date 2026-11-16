import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const data = readFileSync(new URL("../app/resources/resourceData.ts", import.meta.url), "utf8");
const view = readFileSync(new URL("../app/resources/ResourceView.tsx", import.meta.url), "utf8");

const EXISTING_HUB_HREFS = [
  "/guides",
  "/resources/downtown-bay-street-weed-visit-guide",
  "/resources/cannabis-101",
  "/resources/cannabis-dispensary-vs-weed-dispensary",
  "/resources/weed-flower-guide",
  "/resources/flower-guides/what-does-good-weed-mean",
  "/resources/flower-guides/top-shelf-mids-quads",
  "/resources/flower-guides/thc-vs-weed-quality",
  "/resources/flower-guides/bag-appeal",
  "/resources/flower-guides/trichomes-frosty-weed",
  "/resources/flower-guides/terpenes-gas-loud-aroma",
  "/resources/flower-guides/drying-curing-freshness",
  "/resources/flower-guides/smalls-vs-big-buds",
  "/resources/flower-guides/bc-grown-indoor-hydro-outdoor",
  "/resources/flower-guides/craft-vs-commercial-cannabis",
  "/resources/cannabis-101/indica-sativa-hybrid",
  "/resources/cannabis-101/strain-vs-cultivar",
  "/resources/cannabis-101/landrace-vs-hybrid",
  "/resources/cannabis-101/weed-slang-glossary",
  "/resources/cannabis-menu-guide",
  "/resources/weed-value-guide",
  "/resources/pre-roll-guide",
  "/resources/native-smokes",
  "/resources/native-smokes/native-cigarettes-guide",
];

test("the resources hub keeps existing cards and links both articles", () => {
  for (const href of EXISTING_HUB_HREFS) {
    assert.equal(data.includes(`href: "${href}"`), true, href);
  }
  assert.match(data, /CANNABIS_FLOWER_SIZES_CARD,/);
  const flowerCard = readFileSync(new URL("../app/resources/cannabisFlowerSizesExplained.ts", import.meta.url), "utf8");
  assert.match(flowerCard, /title: CANNABIS_FLOWER_SIZES_TITLE/);
  assert.match(flowerCard, /href: CANNABIS_FLOWER_SIZES_PATH/);
  assert.match(data, /WHAT_IS_CRAFT_CANNABIS_CARD,/);
  assert.match(data, /HASH_FORMATS_LEGAL_MENU_CARD,/);
  assert.match(data, /SWEET_KUSH_STRAIN_CARD,/);
  assert.match(data, /latestArticles: \[WHAT_IS_CRAFT_CANNABIS_CARD, HASH_FORMATS_LEGAL_MENU_CARD, SWEET_KUSH_STRAIN_CARD\]/);
  assert.match(data, /title: SWEET_KUSH_STRAIN_TITLE/);
  assert.match(data, /href: SWEET_KUSH_STRAIN_PATH/);
  assert.match(data, /text: SWEET_KUSH_STRAIN_DESCRIPTION/);
  assert.match(data, /CANNABIS_FLOWER_SIZES_PAGE, WHAT_IS_CRAFT_CANNABIS_PAGE, HASH_FORMATS_LEGAL_MENU_PAGE, SWEET_KUSH_STRAIN_PAGE/);
  assert.match(data, /title: WHAT_IS_CRAFT_CANNABIS_TITLE/);
  assert.match(data, /href: WHAT_IS_CRAFT_CANNABIS_PATH/);
  assert.match(data, /text: WHAT_IS_CRAFT_CANNABIS_DESCRIPTION/);
  assert.match(data, /title: HASH_FORMATS_LEGAL_MENU_TITLE/);
  assert.match(data, /href: HASH_FORMATS_LEGAL_MENU_PATH/);
  assert.match(data, /text: HASH_FORMATS_LEGAL_MENU_DESCRIPTION/);
  assert.match(data, /appendResourceCard\("flower-guides\/craft-vs-commercial-cannabis", WHAT_IS_CRAFT_CANNABIS_CARD\)/);
  assert.match(data, /appendResourceCard\("cannabis-101", HASH_FORMATS_LEGAL_MENU_CARD\)/);
  assert.match(data, /adults 19\+/);
  assert.equal(data.includes("3.5"), false);
  assert.equal(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(data), false);

  assert.match(view, /Latest articles/);
  assert.match(view, /href=\{card\.href\}/);
  assert.equal(view.includes("3.5"), false);
});
