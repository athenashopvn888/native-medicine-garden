import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const config = read("next.config.ts");
const products = read("app/lib/products.ts");
const tiers = read("app/lib/tierSeoContent.ts");
const sitemap = read("app/sitemap.ts");
const nav = read("app/components/Navbar.tsx");
const delivery = read("app/weed-delivery-toronto/page.tsx");
const resources = read("app/resources/resourceData.ts");

const migrations = [
  ["/exotic", "/exotic-weed"], ["/premium", "/premium-weed"],
  ["/aaa", "/aaa-weed"], ["/aa", "/aa-weed"], ["/budget", "/budget-weed"],
  ["/delivery", "/weed-delivery-toronto"], ["/resources", "/weed-resources"],
  ["/resources/menu-guide", "/resources/cannabis-menu-guide"],
  ["/resources/flower-guide", "/resources/weed-flower-guide"],
  ["/resources/value-guide", "/resources/weed-value-guide"],
  ["/resources/downtown-bay-street-visit-guide", "/resources/downtown-bay-street-weed-visit-guide"],
];

test("V2 legacy routes redirect directly to Weed or Cannabis canonicals", () => {
  for (const [source, destination] of migrations) {
    assert.match(config, new RegExp(`source: "${source.replaceAll("/", "\\/")}"[^\n]+destination: "${destination.replaceAll("/", "\\/")}"[^\n]+permanent: true`));
  }
});

test("tier names, slugs and metadata use the approved Tier Name + Weed convention", () => {
  for (const [label, slug] of [["Exotic Weed", "exotic-weed"], ["Premium Weed", "premium-weed"], ["AAA+ Weed", "aaa-weed"], ["AA Weed", "aa-weed"], ["Budget Weed", "budget-weed"]]) {
    assert.ok(products.includes(`name: "${label}"`));
    assert.ok(products.includes(`slug: "${slug}"`));
    assert.ok(nav.includes(`href: "/${slug}", label: "${label}"`));
    assert.ok(tiers.includes(`${label.replace("+", "\\+")} & Cannabis Flower Toronto`) || tiers.includes(`${label} & Cannabis Flower Toronto`));
  }
  for (const reversed of ["Weed Exotic", "Weed Premium", "Weed AAA", "Weed AA", "Weed Budget"]) {
    assert.ok(!products.includes(reversed));
    assert.ok(!nav.includes(reversed));
    assert.ok(!tiers.includes(reversed));
  }
});

test("delivery and supporting resources expose only new indexable owners", () => {
  assert.match(delivery, /Weed Delivery Toronto \| Native Medicine Garden Cannabis Dispensary/);
  assert.match(delivery, /https:\/\/www\.nativemedicinecannabis\.com\/weed-delivery-toronto/);
  assert.match(sitemap, /weed-delivery-toronto/);
  assert.doesNotMatch(sitemap, /`\$\{BASE\}\/delivery`/);
  const generatedResources = JSON.parse(read("app/resources/knowledgeData.json"));
  const generatedSlugs = new Set(generatedResources.map((page) => page.slug));
  for (const slug of ["cannabis-menu-guide", "weed-flower-guide", "weed-value-guide", "downtown-bay-street-weed-visit-guide"]) {
    assert.ok(resources.includes(`slug: "${slug}"`) || generatedSlugs.has(slug), `missing ${slug}`);
  }
});
