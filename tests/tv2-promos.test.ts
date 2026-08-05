import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getTv2DaytimePromo,
  isTv2Daytime,
} from "../app/tv2/tv2Promos.ts";

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
    getTv2DaytimePromo("CIGARETTES", true)?.src,
    "/banners/06_Cigarettes.webp",
  );
  assert.equal(
    getTv2DaytimePromo("VAPES", true)?.src,
    "/banners/cig-poster-1.png",
  );
  assert.equal(getTv2DaytimePromo("VAPES", false), undefined);
  assert.equal(getTv2DaytimePromo("EDIBLES", true), undefined);
});

test("NMG TV2 mounts its banner, hiring ribbon, and ticker without Play Games", () => {
  assert.match(tv2Page, /ItemTv\.webp/);
  assert.match(tv2Page, /Native Medicine Garden Items TV Menu/);
  assert.match(tv2Page, /<HiringRibbon \/>/);
  assert.match(tv2Page, /<VerticalTicker \/>/);
  assert.doesNotMatch(tv2Page, /Play Games|\/games/i);
  assert.doesNotMatch(tv2Page, /afterdarkcannabis/i);
  assert.doesNotMatch(tv2Page, /2pack5cig|timedPromoOverlay/);
});
