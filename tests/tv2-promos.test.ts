import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getTv2DaytimePromo,
  isCigaretteOfferVisible,
  isTv2Daytime,
} from "../app/tv2/tv2Promos.ts";
import {
  TV2_HIRING_INTERVAL_MS,
  TV2_PROMO_INTERVAL_MS,
  TV2_TICKER_INTERVAL_MS,
} from "../app/tv2/tv2Timing.ts";
import { TV_TICKER_SLIDES } from "../app/tvTicker.ts";

const tv2Page = readFileSync(
  new URL("../app/tv2/page.tsx", import.meta.url),
  "utf8",
);

test("TV2 daytime uses the local device hour from 10:00 through 16:59", () => {
  assert.equal(isTv2Daytime(new Date(2026, 6, 29, 9, 59, 59)), false);
  assert.equal(isTv2Daytime(new Date(2026, 6, 29, 10, 0, 0)), true);
  assert.equal(isTv2Daytime(new Date(2026, 6, 29, 16, 59, 59)), true);
  assert.equal(isTv2Daytime(new Date(2026, 6, 29, 17, 0, 0)), false);
});

test("daytime promos match the After Dark vapes and cigarettes creatives", () => {
  const cigarettes = getTv2DaytimePromo("CIGARETTES", true);
  assert.equal(cigarettes?.src, "/banners/cig-poster-1.png");
  assert.equal(cigarettes?.alt, "Cigarettes Promo");

  const vapes = getTv2DaytimePromo("VAPES", true);
  assert.equal(
    vapes?.src,
    "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/cannabis_banner_mashup_variation_01_600x600.webp",
  );
  assert.equal(
    vapes?.fallbackSrc,
    "/banners/cannabis_banner_mashup_variation_01_600x600.webp",
  );
  assert.equal(vapes?.alt, "Ultimate Cannabis Collection Promo");
  assert.equal(getTv2DaytimePromo("VAPES", false), undefined);
  assert.equal(getTv2DaytimePromo("CIGARETTES", false), undefined);
  assert.equal(getTv2DaytimePromo("EDIBLES", true), undefined);
});

test("evening cigarette offer covers the last 10 seconds of each 30 second cycle", () => {
  assert.equal(isCigaretteOfferVisible(true, 25_000), false);
  assert.equal(isCigaretteOfferVisible(false, 0), false);
  assert.equal(isCigaretteOfferVisible(false, 19_999), false);
  assert.equal(isCigaretteOfferVisible(false, 20_000), true);
  assert.equal(isCigaretteOfferVisible(false, 29_999), true);
  assert.equal(isCigaretteOfferVisible(false, 30_000), false);
  assert.equal(isCigaretteOfferVisible(false, 50_000), true);
  assert.equal(isCigaretteOfferVisible(false, -1), false);
  assert.equal(isCigaretteOfferVisible(false, Number.NaN), false);
});

test("NMG TV2 removes only its top banner and retains display bands", () => {
  assert.doesNotMatch(tv2Page, /ItemTv\.webp/);
  assert.doesNotMatch(tv2Page, /menuBanner|menuBannerImage/);
  assert.match(tv2Page, /<HiringRibbon \/>/);
  assert.match(tv2Page, /<VerticalTicker \/>/);
  assert.match(tv2Page, /<PromoCard/);
  assert.match(tv2Page, /className=\{styles\.grid\}/);
  assert.match(tv2Page, /data-promo-card=\{cardId\}/);
  assert.doesNotMatch(tv2Page, /Play Games|\/games/i);
  assert.doesNotMatch(tv2Page, /afterdarkcannabis/i);
});

test("TV2 evening cigarette card uses the 2 Pack $5 overlay outside daytime promos", () => {
  assert.match(tv2Page, /2pack5cig/);
  assert.match(tv2Page, /timedPromoOverlay/);
  assert.match(tv2Page, /isCigaretteOfferVisible/);
  assert.match(tv2Page, /setInterval\(updateOffer, 250\)/);
  assert.match(tv2Page, /setInterval\(sync, 60_000\)/);
  assert.match(tv2Page, /offerOverlay=\{card\.id === "CIGARETTES" && cigaretteOfferVisible\}/);
  assert.match(tv2Page, /alt="Mix and Match 2 Pack \$5 Cigarette Offer"/);
  assert.match(tv2Page, /src=\{promo\.src\}/);
  assert.match(tv2Page, /promo\.fallbackSrc/);
});

test("NMG TV2 uses the exact approved display timers", () => {
  assert.equal(TV2_HIRING_INTERVAL_MS, 3_000);
  assert.equal(TV2_TICKER_INTERVAL_MS, 5_500);
  assert.equal(TV2_PROMO_INTERVAL_MS, 9_000);
  assert.match(tv2Page, /TV2_HIRING_INTERVAL_MS/);
  assert.match(tv2Page, /TV2_TICKER_INTERVAL_MS/);
  assert.match(tv2Page, /TV2_PROMO_INTERVAL_MS/);
  assert.deepEqual([...TV_TICKER_SLIDES], [
    "OPEN 24 HOURS",
    "ALL SALES ARE FINAL, NO EXCHANGE, NO REFUND",
  ]);
  assert.equal(TV_TICKER_SLIDES.length, 2);
});

test("NMG TV2 refits against the visual viewport without showing an unscaled canvas", () => {
  assert.match(tv2Page, /useLayoutEffect/);
  assert.match(tv2Page, /window\.visualViewport/);
  assert.match(tv2Page, /new ResizeObserver\(scheduleFit\)/);
  assert.match(tv2Page, /visualViewport\?\.addEventListener\("resize", scheduleFit\)/);
  assert.match(tv2Page, /visualViewport\?\.addEventListener\("scroll", scheduleFit\)/);
  assert.match(tv2Page, /document\.addEventListener\("visibilitychange", scheduleFit\)/);
  assert.match(tv2Page, /for \(const delay of \[100, 500, 1500\]\)/);
  assert.match(tv2Page, /dataset\.fitted = "true"/);
});
