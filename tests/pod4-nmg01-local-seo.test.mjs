import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const layout = read("app/layout.tsx");
const store = read("app/lib/store.ts");
const homepage = read("app/HomePageClient.tsx");
const homePage = read("app/page.tsx");
const visit = read("app/visit/page.tsx");
const city = read("app/weed-dispensary-toronto/page.tsx");
const config = read("next.config.ts");
const proxy = read("proxy.ts");
const sitemap = read("app/sitemap.ts");
const footer = read("app/components/Footer.tsx");

const PUBLIC_COPY = [store, homepage, visit, layout, city, read("app/lib/gbp-location.ts")].join("\n");

test("homepage schema identity is CannabisStore on www.nativemedicinecannabis.com with FMD phone", () => {
  assert.match(store, /"@type": "CannabisStore"/);
  assert.match(store, /https:\/\/www\.nativemedicinecannabis\.com/);
  assert.match(store, /\+14373744544/);
  assert.match(layout, /cannabisStoreJsonLd/);
  assert.match(homePage, /faqPageJsonLd\(HOME_FAQS/);
  assert.match(store, /"@type": "FAQPage"/);
});

test("OG and schema images use the local welcome banner, not 403 wp-content assets", () => {
  assert.match(store, /\/banners\/welcome_banner\.webp/);
  assert.doesNotMatch(PUBLIC_COPY, /wp-content\/uploads\/2026\/04/);
  assert.doesNotMatch(PUBLIC_COPY, /7Clmh\.jpg/);
  assert.doesNotMatch(PUBLIC_COPY, /46Oi5\.jpg/);
  assert.doesNotMatch(read("app/page.module.css"), /wp-content\/uploads/);
});

test("/visit is a supporting how-to-reach page with NAP, transit, and parking in source", () => {
  assert.match(store, /76 Gerrard St W, Toronto, ON M5G 1J5/);
  assert.match(store, /\+1 \(437\) 374-4544/);
  assert.match(visit, /ADDRESS_LINE/);
  assert.match(visit, /PHONE_DISPLAY/);
  assert.match(visit, /76 Gerrard St W/);
  assert.match(visit, /College Station/);
  assert.match(visit, /Dundas Station/);
  assert.match(visit, /Free evening street parking/);
  assert.match(visit, /Homepage visit hub/);
  assert.match(visit, /PRIMARY_ORIGIN\}\/visit/);
  assert.match(sitemap, /\$\{BASE\}\/visit/);
});

test("city weed-dispensary-toronto page is noindex and canonicalizes to the homepage", () => {
  assert.match(city, /index: false/);
  assert.match(city, /canonical: PRIMARY_ORIGIN/);
  assert.match(city, /url: PRIMARY_ORIGIN/);
  assert.doesNotMatch(sitemap, /weed-dispensary-toronto/);
});

test("legacy .ca hosts permanently redirect to www.nativemedicinecannabis.com", () => {
  assert.match(config, /nativemedicinegarden\.ca/);
  assert.match(config, /www\.nativemedicinegarden\.ca/);
  assert.match(config, /destination: "https:\/\/www\.nativemedicinecannabis\.com\/:path\*"/);
  assert.match(config, /permanent: true/);
  assert.match(proxy, /nativemedicinegarden\.ca/);
  assert.match(proxy, /NextResponse\.redirect\([^\n]+, 301\)/);
});

test("homepage remains the visit hub and keeps existing Open 24 Hours wording", () => {
  assert.match(homepage, /id="contact"/);
  assert.match(homepage, /How to reach Gerrard/);
  assert.match(homepage, /Open 24 Hours/);
  assert.match(footer, /href="\/visit"/);
  assert.match(layout, /canonical: PRIMARY_ORIGIN/);
  assert.match(layout, /Gerrard & Bay Dispensary/);
});

test("public catch-up copy stays Gerrard/Bay walk-in and does not invent Native cultural claims or sister stores", () => {
  assert.match(PUBLIC_COPY, /Gerrard/);
  assert.match(PUBLIC_COPY, /College–Bay|College-Bay/);
  for (const forbidden of [
    "Indigenous",
    "First Nation",
    "reserve",
    "healing",
    "ceremonial",
    "traditional medicine",
    "Pleasant Cannabis",
    "Planet X",
    "Main Kingston",
    "sister store",
    "our other locations",
    "Jane St",
    "(437) 339-4466",
    "437-339-4466",
  ]) {
    assert.equal(PUBLIC_COPY.includes(forbidden), false, forbidden);
  }
});
