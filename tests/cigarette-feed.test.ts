import assert from "node:assert/strict";
import test from "node:test";
import {
  CIG_WORDING_FALLBACK,
  cigaretteBoardItems,
  cigarettePublicHeaders,
  decideCigaretteGuide,
  decideCigaretteSurface,
  readCigaretteTvHeader,
  reconcileSurfaceItems,
  resolveCigWording,
  resolveSurfaceFlag,
} from "../app/lib/cigDecision.ts";

const carton = { category: "CIGARETTES", name: "BB FULL CARTON", slug: "bb-full-carton" };
const grabba = { category: "CIGARETTES", name: "GRABBA", slug: "grabba" };
const backwoods = { category: "CIGARETTES", name: "BACKWOODS ASSORTED FLAVORS $20-$25", slug: "backwoods-assorted-flavors-20-25" };
const pouch = { category: "CIGARETTES", name: "NICOTINE POUCHES , VELO, PABLO, KILLA", slug: "nicotine-pouches-velo-pablo-killa" };
const vape = { category: "VAPE PENS", name: "Mango Ice", slug: "mango-ice" };

const wording = {
  bannerText: "FEED BANNER",
  promoBrands: "FEED BRANDS",
  tv2BoardTitle: "FEED BOARD",
  wrapsTitle: "BACKWOODS",
  tickerLine1: "FEED TICKER",
  priceTwoPack: "$5",
  priceCarton: "$25",
  priceBelmont: "$10",
  priceBB2Pack: "$5",
};

function cig(extra: Record<string, unknown> = {}) {
  return { on: false, tvOn: false, webOn: false, webFollowsTv: true, wording, ...extra };
}

test("website follows webOn and TV follows tvOn, with on as the fallback", () => {
  const items = [carton, backwoods];
  assert.equal(decideCigaretteSurface({ cig: cig({ webOn: true, tvOn: false }), items, surface: "web" }).show, true);
  assert.equal(decideCigaretteSurface({ cig: cig({ webOn: true, tvOn: false }), items, surface: "tv" }).show, false);
  assert.equal(decideCigaretteSurface({ cig: cig({ webOn: false, tvOn: true }), items, surface: "web" }).show, false);
  assert.equal(decideCigaretteSurface({ cig: cig({ webOn: false, tvOn: true }), items, surface: "tv" }).show, true);
  assert.equal(resolveSurfaceFlag({ on: true }, "web"), true);
  assert.equal(resolveSurfaceFlag({ on: true }, "tv"), true);
  assert.equal(resolveSurfaceFlag(cig({ on: true, webOn: false }), "web"), false);
  assert.equal(resolveSurfaceFlag(cig({ on: false, tvOn: true, webFollowsTv: true }), "tv"), true);
  assert.equal(resolveSurfaceFlag(cig({ on: true, webOn: false, webFollowsTv: true }), "web"), false);
});

test("a missing feed keeps the coded switch on the website and leaves the TV board up", () => {
  const items = [carton, grabba, backwoods];
  const missing = decideCigaretteSurface({ cig: null, items, surface: "web" });
  assert.equal(missing.reason, "missing");
  assert.equal(missing.show, false);
  assert.equal(decideCigaretteSurface({ cig: null, items, surface: "web", codedShow: true }).show, true);
  assert.equal(decideCigaretteSurface({ cig: null, items, surface: "tv", codedShow: false }).show, true);
  assert.equal(decideCigaretteSurface({ cig: cig(), items, surface: "tv" }).show, false);
  assert.equal(decideCigaretteSurface({ cig: cig({ on: true, webOn: true, tvOn: true }), items: [backwoods, pouch], surface: "web" }).reason, "no-items");
  const errored = decideCigaretteSurface({ cig: cig({ on: true, webOn: false, tvOn: false }), items, surface: "web", errored: true });
  assert.equal(errored.reason, "error");
  assert.equal(errored.show, false);
  assert.equal(decideCigaretteSurface({ cig: cig({ on: true, webOn: false, tvOn: false }), items, surface: "tv", errored: true, codedShow: false }).show, true);
  assert.equal(decideCigaretteSurface({ cig: cig({ on: true, webOn: true, tvOn: true }), items, surface: "tv", envRaw: "false" }).reason, "env");
  assert.equal(decideCigaretteSurface({ cig: cig({ on: true, webOn: true, tvOn: true }), items, surface: "web", envRaw: "true" }).show, true);
});

test("wording uses the feed and falls back to the current copy field by field", () => {
  assert.equal(resolveCigWording({ bannerText: "  FEED BANNER  ", wrapsTitle: "" }).bannerText, "FEED BANNER");
  assert.equal(resolveCigWording({ bannerText: "  FEED BANNER  " }).wrapsTitle, CIG_WORDING_FALLBACK.wrapsTitle);
  assert.equal(resolveCigWording(undefined).tickerLine1, CIG_WORDING_FALLBACK.tickerLine1);
  assert.equal(decideCigaretteSurface({ cig: cig({ webOn: false }), items: [backwoods], surface: "web" }).wording.wrapsTitle, "BACKWOODS");
  assert.equal(decideCigaretteSurface({ cig: null, items: [], surface: "tv" }).wording.bannerText, CIG_WORDING_FALLBACK.bannerText);
});

test("null flags with real cigarettes stay open and an explicit false still hides", () => {
  const open = decideCigaretteSurface({ cig: { on: null, webOn: null, tvOn: null, wording }, items: [carton], surface: "web" });
  assert.equal(open.show, true);
  assert.equal(open.reason, "on");
  assert.equal(decideCigaretteSurface({ cig: { on: false }, items: [carton], surface: "tv" }).reason, "off");
  assert.equal(decideCigaretteGuide({ cig: { master: null, on: null }, items: [carton] }).show, true);
});

test("guide pages follow the master switch and a feed error keeps the coded switch", () => {
  const items = [carton];
  assert.equal(decideCigaretteGuide({ cig: cig({ on: false, master: false, webOn: true }), items }).show, false);
  assert.equal(decideCigaretteGuide({ cig: cig({ on: true, master: true, webOn: false }), items }).show, true);
  assert.equal(decideCigaretteGuide({ cig: null, items, errored: true }).show, false);
  assert.equal(decideCigaretteGuide({ cig: null, items, errored: true, codedShow: true }).show, true);
  assert.equal(decideCigaretteGuide({ cig: cig({ on: true, master: true }), items, envRaw: "off" }).reason, "env");
});

test("tvOn shows the cigarette card items and webOn false keeps the website hidden", () => {
  const items = [carton, backwoods, pouch];
  const feed = cig({ webOn: false, tvOn: true });
  assert.equal(decideCigaretteSurface({ cig: feed, items, surface: "tv" }).show, true);
  assert.equal(decideCigaretteSurface({ cig: feed, items, surface: "web" }).show, false);
  assert.deepEqual(cigaretteBoardItems(items, true).map((item) => item.slug), [carton.slug, backwoods.slug, pouch.slug]);
  assert.deepEqual(cigaretteBoardItems(items, false).map((item) => item.slug), [backwoods.slug, pouch.slug]);
  const headers = cigarettePublicHeaders({
    web: false,
    tv: true,
    wording: CIG_WORDING_FALLBACK,
  });
  assert.equal(headers["x-tv-data-cig-tv"], "1");
  assert.equal(headers["x-tv-data-cig-web"], "0");
  assert.equal(readCigaretteTvHeader({ get: (name) => headers[name] ?? null }).show, true);
  assert.equal(readCigaretteTvHeader({ get: () => null }).show, false);
});

test("a closed TV board keeps backwood, cigarillo, paper, pouch, zyn, velo, and wrap rows", () => {
  const kept = ["BACKWOOD", "CIGARILLO", "ROLLING PAPER", "NICOTINE POUCH", "ZYN CITRUS", "VELO", "HEMP WRAP"].map((name) => ({
    category: "CIGARETTES",
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
  }));
  const shelf = [carton, ...kept];
  assert.deepEqual(cigaretteBoardItems(shelf, false).map((item) => item.slug), kept.map((item) => item.slug));
  assert.equal(reconcileSurfaceItems(shelf, shelf, false).some((item) => item.slug === carton.slug), false);
  assert.equal(reconcileSurfaceItems(shelf, shelf, true).some((item) => item.slug === carton.slug), true);
});

test("each surface hides real cigarettes itself and always keeps wraps and pouches", () => {
  const menu = [vape, carton, grabba, backwoods, pouch];
  const hidden = reconcileSurfaceItems(menu, menu, false);
  assert.deepEqual(hidden.map((item) => item.slug), [vape.slug, backwoods.slug, pouch.slug]);
  const shown = reconcileSurfaceItems([vape, backwoods], [carton, backwoods], true);
  assert.deepEqual(shown.map((item) => item.slug), [vape.slug, backwoods.slug, carton.slug]);
});
