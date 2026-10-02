import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("TOP WEED TIER announcement stack uses the approved order and exact offer", () => {
  const banner = read("app/components/FleetAnnouncementBanner.tsx");
  const strip = read("app/lib/flowerDeals.ts");
  assert.match(strip, /TOP WEED TIER SPECIAL · \$\{BOGO_BUY_2_GET_1\}  \$\{BOGO_BUY_3_GET_3\} \*/);
  const markers = [
    "<FlowerBogoStrip hero />",
    'data-exotic-tier-banner=""',
    'data-cigarette-deal=""',
    'data-bb-light-deal=""',
    'data-cig-mix-banner=""',
    'data-belmont-premium-banner=""',
  ];
  let offset = -1;
  for (const marker of markers) {
    const next = banner.indexOf(marker);
    assert.ok(next > offset, `${marker} should follow the previous stack item`);
    offset = next;
  }
  assert.ok(existsSync(new URL("../public/banners/top-weed-tier-nmg01.webp", import.meta.url)));
  assert.ok(!existsSync(new URL("../public/banners/bb-premium-grade-full-lights.webp", import.meta.url)));
  assert.ok(existsSync(new URL("../public/banners/BB_Belmont_Premium_Grade.webp", import.meta.url)));
  assert.ok(existsSync(new URL("../public/banners/2pack5cig.webp", import.meta.url)));
});

test("Dual-Frame math is exact on Exotic, Premium and AAA+ only", () => {
  const products = read("app/lib/products.ts");
  for (const row of [
    ["EXOTIC", 20, 40, 60],
    ["PREMIUM", 15, 30, 45],
    ['"AAA+"', 10, 20, 30],
  ]) {
    const [key, list, pay3, pay6] = row;
    const start = products.indexOf(`${key}: {`);
    const end = products.indexOf("\n  },", start);
    const block = products.slice(start, end);
    assert.match(block, new RegExp(`unitPrice: ${list}`));
    assert.match(block, new RegExp(`price: ${pay3}, grams: 3, equals: "2g=3g"`));
    assert.match(block, new RegExp(`price: ${pay6}, grams: 6, equals: "3g=6g"`));
  }
  const aa = products.slice(products.indexOf("AA: {"), products.indexOf("BUDGET: {"));
  assert.match(aa, /deal3g: null/);
  assert.match(aa, /deal6g: null/);
  assert.doesNotMatch(products, /3\.5g|7g/);
});

test("all five tier pages expose corridor metadata, H1 and CollectionPage ItemList", () => {
  const tierPage = read("app/[tier]/page.tsx");
  assert.match(tierPage, /\$\{tierInfo\.config\.name\} & Cannabis Flower \| \$\{CORRIDOR\} \| Native Medicine Garden/);
  assert.match(tierPage, /\{config\.name\} &amp; Cannabis Flower at Gerrard &amp; Bay/);
  assert.match(tierPage, /"@type": "CollectionPage"/);
  assert.match(tierPage, /"@type": "ItemList"/);
  assert.match(tierPage, /numberOfItems: flowers\.length/);
});

test("four Wave H pillars are indexable, self-canonical and appended to sitemap", () => {
  const routes = [
    "weed-dispensary-gerrard-bay",
    "24-hour-gerrard-bay-dispensary",
    "native-cigarettes-gerrard-bay",
    "nicotine-vape-gerrard-bay",
  ];
  const sitemap = read("app/sitemap.ts");
  const cards = read("app/HomePageClient.tsx");
  for (const route of routes) {
    const page = read(`app/${route}/page.tsx`);
    assert.match(page, /robots: \{ index: true, follow: true \}/);
    assert.match(page, /alternates: \{ canonical:/);
    assert.match(sitemap, new RegExp(`\/${route}`));
    assert.match(cards, new RegExp(`\/${route}`));
  }
  assert.match(cards, /\/weed-delivery-toronto/);
  assert.match(cards, /\/visit/);
});

test("nicotine and THC vape shelves stay separate and Native wording is bounded", () => {
  const authority = read("app/lib/authorityPages.ts");
  assert.match(authority, /Nicotine devices belong on a different shelf from THC and cannabis vapes/);
  assert.match(authority, /Native cigarettes is used here only as a merchandise category/);
  assert.doesNotMatch(authority, /GPC|CVC|cure|treat|healing|medicine claim/i);
});
