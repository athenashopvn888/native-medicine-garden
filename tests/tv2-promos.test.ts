import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getNextTv2PromoIndex,
  getTv2DaytimePromo,
  getTv2PromoRotationUrls,
  isTv2Daytime,
} from "../app/tv2/tv2Promos.ts";
import {
  TV2_HIRING_INTERVAL_MS,
  TV2_PROMO_INTERVAL_MS,
  TV2_TICKER_INTERVAL_MS,
} from "../app/tv2/tv2Timing.ts";

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

test("daytime promos use existing NMG cigarette and vape assets", () => {
  assert.equal(
    getTv2DaytimePromo("CIGARETTES", true)?.imageUrls[0],
    "/banners/06_Cigarettes.webp",
  );
  assert.equal(
    getTv2DaytimePromo("VAPES", true)?.imageUrls[0],
    "/banners/cig-poster-1.png",
  );
  assert.equal(getTv2DaytimePromo("VAPES", false), undefined);
  assert.equal(getTv2DaytimePromo("EDIBLES", true), undefined);
});

test("promo rotation advances only configured creatives", () => {
  const multiple = getTv2PromoRotationUrls({
    imageUrls: ["/one.webp", "", "/two.webp", "/one.webp"],
    fallbackSrc: "/fallback.webp",
    alt: "Test",
  });
  assert.deepEqual(multiple, ["/one.webp", "/two.webp"]);
  assert.equal(getNextTv2PromoIndex(0, multiple.length), 1);
  assert.equal(getNextTv2PromoIndex(1, multiple.length), 0);

  const single = getTv2PromoRotationUrls({
    imageUrls: ["/single.webp"],
    fallbackSrc: "/fallback.webp",
    alt: "Test",
  });
  assert.deepEqual(single, ["/single.webp"]);
  assert.equal(getNextTv2PromoIndex(0, single.length), 0);
  assert.doesNotMatch(single.join(" "), /fallback/);
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
  assert.doesNotMatch(tv2Page, /2pack5cig|timedPromoOverlay/);
});

test("NMG TV2 uses the exact approved display timers", () => {
  assert.equal(TV2_HIRING_INTERVAL_MS, 3_000);
  assert.equal(TV2_TICKER_INTERVAL_MS, 5_500);
  assert.equal(TV2_PROMO_INTERVAL_MS, 9_000);
  assert.match(tv2Page, /TV2_HIRING_INTERVAL_MS/);
  assert.match(tv2Page, /TV2_TICKER_INTERVAL_MS/);
  assert.match(tv2Page, /TV2_PROMO_INTERVAL_MS/);
});
