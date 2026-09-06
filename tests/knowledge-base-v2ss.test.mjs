import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pages = JSON.parse(fs.readFileSync("app/resources/knowledgeData.json", "utf8"));
const source = (path) => fs.readFileSync(path, "utf8");

const requiredSubjects = [
  "cannabis-dispensary-vs-weed-dispensary", "cannabis-101", "downtown-bay-street-weed-visit-guide", "weed-flower-guide",
  "flower-guides/what-does-good-weed-mean", "flower-guides/top-shelf-mids-quads", "flower-guides/thc-vs-weed-quality",
  "flower-guides/bag-appeal", "flower-guides/trichomes-frosty-weed", "flower-guides/terpenes-gas-loud-aroma",
  "flower-guides/drying-curing-freshness", "flower-guides/smalls-vs-big-buds", "flower-guides/bc-grown-indoor-hydro-outdoor",
  "flower-guides/craft-vs-commercial-cannabis", "cannabis-101/indica-sativa-hybrid", "cannabis-101/strain-vs-cultivar",
  "cannabis-101/landrace-vs-hybrid", "cannabis-101/weed-slang-glossary", "native-smokes/native-cigarettes-guide",
];

test("all 20 ADC subjects map to the approved 19 unique resource owners", () => {
  const slugs = new Set(pages.map((page) => page.slug));
  for (const slug of requiredSubjects) assert.ok(slugs.has(slug), `missing ${slug}`);
  assert.equal(requiredSubjects.length, 19);
});

test("every long-form authority owner has metadata, one H1 source and visible FAQ data", () => {
  for (const slug of requiredSubjects) {
    const page = pages.find((candidate) => candidate.slug === slug);
    assert.ok(page.title);
    assert.ok(page.seoTitle);
    assert.ok(page.description);
    assert.ok(page.blocks.length > 0);
    assert.ok(page.faqs.length >= 4, `${slug} FAQ count`);
  }
});

test("evergreen packet output contains no internal workflow language or fixed deal copy", () => {
  const rendered = JSON.stringify(pages);
  for (const forbidden of [
    "PINKY", "Agent X", "canonical evidence", "$20/g", "3g for $", "6g around $",
    "The current NMG evidence supports", "The current version of this guide should",
    "evergreen authority guide", "everyday search language", "Brand Names Need Evidence",
    "Current Prices and Availability Belong on Current Product Surfaces",
    "current product surfaces",
    "Native Medicine Garden and Protected Native Wording", "old version of this page leaned",
  ]) {
    assert.equal(rendered.includes(forbidden), false, forbidden);
  }
});

test("protected Weed routes and labels remain wired", () => {
  const products = source("app/lib/products.ts");
  for (const [label, slug] of [["Exotic Weed", "exotic-weed"], ["Premium Weed", "premium-weed"], ["AAA+ Weed", "aaa-weed"], ["AA Weed", "aa-weed"], ["Budget Weed", "budget-weed"]]) {
    assert.ok(products.includes(`name: "${label}"`));
    assert.ok(products.includes(`slug: "${slug}"`));
  }
});

test("resource rendering includes canonical schema, FAQ schema and no raw Markdown renderer", () => {
  const view = source("app/resources/ResourceView.tsx");
  assert.ok(view.includes('"@type": "FAQPage"'));
  assert.ok(view.includes('"@type": "BreadcrumbList"'));
  assert.ok(view.includes("inlineText"));
  assert.equal(view.includes("react-markdown"), false);
});

test("local owner receives only the approved compact education links", () => {
  const local = source("app/components/GBPLandingPage.tsx");
  assert.ok(local.includes("Learn Before You Browse"));
  for (const route of ["/resources/downtown-bay-street-weed-visit-guide", "/resources/cannabis-101", "/resources/weed-flower-guide", "/weed-resources"]) assert.ok(local.includes(route));
});
