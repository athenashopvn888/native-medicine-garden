import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrRetainSmartLineup,
  buildSmartLineup,
  defaultSmartMenuState,
  NMG_SMART_TIERS,
  SmartMenuInputError,
  type CatalogFlower,
  type RawInventory,
  type SmartMenuConfig,
  type SmartTier,
} from "../app/lib/nmgSmartMenu.ts";

const BASE = new Date("2026-08-06T12:00:00.000Z");
const PERIOD_MS = 4 * 60 * 60_000;
const tierBases: Record<SmartTier, number> = { EXOTIC: 500, PREMIUM: 400, "AAA+": 300, AA: 200, BUDGET: 100 };

function flower(sku: string, tier: SmartTier, options: { sale?: boolean; saleRank?: number } = {}): CatalogFlower {
  return {
    sku,
    name: `FLOWER ${sku}`,
    slug: `flower-${sku}`,
    tier,
    type: Number(sku) % 2 ? "indica" : "sativa",
    isSale: Boolean(options.sale),
    saleRank: options.saleRank,
    thc: "30%",
    price3g: { regular: 20, sale: options.sale ? 15 : null },
    price5g: { regular: 30, sale: null },
    price14g: null,
    price28g: null,
    image: `/products/${sku}.webp`,
  };
}

function fixtureFlowers(perTier = 4) {
  return NMG_SMART_TIERS.flatMap((tier) => Array.from({ length: perTier }, (_, index) => {
    const sku = String(tierBases[tier] + index + 1);
    return flower(sku, tier, index === 0 ? { sale: true, saleRank: NMG_SMART_TIERS.indexOf(tier) + 1 } : {});
  }));
}

function inventoryFor(flowers: CatalogFlower[], now = BASE, quantities: Record<string, Record<string, number>> = {}): RawInventory {
  const stock: Record<string, Record<string, number>> = {};
  for (const product of flowers) stock[product.sku] = quantities[product.sku] || { "3g": (Number(product.sku) % 4) + 3 };
  return { storeCode: "NMG01", date: now.toISOString(), skuCount: Object.keys(stock).length, stock };
}

function config(flowers: CatalogFlower[], overrides: Partial<SmartMenuConfig> = {}): SmartMenuConfig {
  const saleRanks = Object.fromEntries(flowers.filter((product) => product.isSale).map((product, index) => [product.sku, product.saleRank || index + 1]));
  const thresholds = (value: number) => Object.fromEntries(NMG_SMART_TIERS.map((tier) => [tier, value])) as Record<SmartTier, number>;
  return {
    storeCode: "NMG01",
    periodHours: 4,
    freshnessMaxHours: 30,
    safetyStock: thresholds(2),
    clearTailMax: thresholds(12),
    pageSize: 10,
    mustTryStablePeriods: 3,
    mustTryCooldownPeriods: 2,
    minSnapshotCoverageRatio: 0.55,
    saleRanks,
    ...overrides,
  };
}

function build(flowers: CatalogFlower[], state = defaultSmartMenuState(BASE), now = BASE, inventory = inventoryFor(flowers, now), cfg = config(flowers)) {
  return buildSmartLineup({ inventory, flowers, items: [], state, config: cfg, now });
}

function allProducts(lineup: ReturnType<typeof build>["lineup"]) {
  return NMG_SMART_TIERS.flatMap((tier) => lineup.tiers[tier].pages.flatMap((page) => page.products));
}

test("valid inventory preserves per-weight quantities, timestamp, coverage, and one priority badge", () => {
  const flowers = fixtureFlowers();
  const inventory = inventoryFor(flowers, BASE, { "502": { "3g": 4, "5g": 2, "14g": 1 } });
  const { lineup } = build(flowers, defaultSmartMenuState(BASE), BASE, inventory);
  const product = allProducts(lineup).find((row) => row.sku === "502");
  assert.deepEqual(product?.quantities, { "3g": 4, "5g": 2, "14g": 1 });
  assert.equal(product?.totalUnits, 7);
  assert.equal(product?.stockTimestamp, inventory.date);
  assert.equal(lineup.manifest.accepted, true);
  assert.equal(lineup.manifest.includedSkus, flowers.length);
  assert.equal(new Set(allProducts(lineup).map((row) => row.sku)).size, flowers.length);
  for (const row of allProducts(lineup)) {
    assert.equal([row.isSale, row.isHot, row.isMustTry].filter(Boolean).length, row.smartBadge === "REGULAR" ? 0 : 1);
  }
});

test("sale pages are unlimited, explicitly ranked, stable, and precede regular pages", () => {
  const sales = Array.from({ length: 12 }, (_, index) => flower(String(600 + index), "EXOTIC", { sale: true, saleRank: 12 - index }));
  const flowers = [...sales, flower("699", "EXOTIC"), ...NMG_SMART_TIERS.slice(1).map((tier) => flower(String(tierBases[tier] + 90), tier))];
  const cfg = config(flowers, { pageSize: 10 });
  const first = build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), cfg);
  const secondNow = new Date(BASE.getTime() + PERIOD_MS);
  const second = build(flowers, first.nextState, secondNow, inventoryFor(flowers, secondNow), cfg);
  const pages = first.lineup.tiers.EXOTIC.pages;
  assert.deepEqual(pages.map((page) => page.kind), ["sale", "sale", "regular"]);
  const ranks = pages.filter((page) => page.kind === "sale").flatMap((page) => page.products.map((row) => row.saleRank));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => Number(a) - Number(b)));
  assert.deepEqual(
    pages.filter((page) => page.kind === "sale").map((page) => [page.id, page.products.map((row) => row.sku)]),
    second.lineup.tiers.EXOTIC.pages.filter((page) => page.kind === "sale").map((page) => [page.id, page.products.map((row) => row.sku)]),
  );
});

test("missing explicit saleRank fails closed", () => {
  const flowers = [flower("501", "EXOTIC", { sale: true }), ...NMG_SMART_TIERS.slice(1).map((tier) => flower(String(tierBases[tier] + 1), tier))];
  assert.throws(() => build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), config(flowers, { saleRanks: {} })), (error) => error instanceof SmartMenuInputError && error.code === "MISSING_SALE_RANK");
});

test("TOP PICK is one safe low-stock product per tier with SKU tie-break and prior-period cooldown", () => {
  const flowers = fixtureFlowers();
  const quantities = Object.fromEntries(flowers.map((row) => [row.sku, { "3g": row.isSale ? 20 : row.sku.endsWith("2") || row.sku.endsWith("3") ? 4 : 20 }]));
  const first = build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE, quantities));
  for (const tier of NMG_SMART_TIERS) {
    const tops = allProducts(first.lineup).filter((row) => row.tier === tier && row.smartBadge === "TOP PICK");
    assert.equal(tops.length, 1);
    assert.equal(tops[0].sku, String(tierBases[tier] + 2));
  }
  const nextNow = new Date(BASE.getTime() + PERIOD_MS);
  const second = build(flowers, first.nextState, nextNow, inventoryFor(flowers, nextNow, quantities));
  for (const tier of NMG_SMART_TIERS) {
    const top = allProducts(second.lineup).find((row) => row.tier === tier && row.smartBadge === "TOP PICK");
    assert.equal(top?.sku, String(tierBases[tier] + 3));
  }
});

test("MUST TRY requires three unchanged consecutive periods, lasts one period, then cools down", () => {
  const flowers = fixtureFlowers(6);
  let state = defaultSmartMenuState(BASE);
  let built: ReturnType<typeof build> | undefined;
  for (let index = 0; index < 3; index += 1) {
    const now = new Date(BASE.getTime() + index * PERIOD_MS);
    built = build(flowers, state, now, inventoryFor(flowers, now));
    state = built.nextState;
    assert.equal(built.lineup.manifest.mustTryCount, index < 2 ? 0 : 5);
  }
  const priorMust = { ...state.previousMustByTier };
  const nextNow = new Date(BASE.getTime() + 3 * PERIOD_MS);
  const next = build(flowers, state, nextNow, inventoryFor(flowers, nextNow));
  for (const tier of NMG_SMART_TIERS) {
    const must = allProducts(next.lineup).find((row) => row.tier === tier && row.smartBadge === "MUST TRY");
    assert.notEqual(must?.sku, priorMust[tier]);
  }
});

test("regular Set A/B/C membership rotates by four-hour version with complete no-repeat coverage", () => {
  const flowers = fixtureFlowers(12).map((row) => ({ ...row, isSale: false, saleRank: undefined, price3g: { regular: 20, sale: null } }));
  const cfg = config(flowers, { pageSize: 4, saleRanks: {} });
  const first = build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), cfg);
  const nextNow = new Date(BASE.getTime() + PERIOD_MS);
  const second = build(flowers, first.nextState, nextNow, inventoryFor(flowers, nextNow), cfg);
  for (const tier of NMG_SMART_TIERS) {
    assert.deepEqual(first.lineup.tiers[tier].pages.map((page) => page.label), ["Set A", "Set B", "Set C"]);
    const firstSkus = first.lineup.tiers[tier].pages.flatMap((page) => page.products.map((row) => row.sku));
    const secondSkus = second.lineup.tiers[tier].pages.flatMap((page) => page.products.map((row) => row.sku));
    assert.equal(new Set(firstSkus).size, firstSkus.length);
    assert.deepEqual([...firstSkus].sort(), [...secondSkus].sort());
    assert.notDeepEqual(first.lineup.tiers[tier].pages.map((page) => page.products.map((row) => row.sku)), second.lineup.tiers[tier].pages.map((page) => page.products.map((row) => row.sku)));
  }
});

test("malformed, stale, and partial inputs retain the durable last-known-good lineup", () => {
  const flowers = fixtureFlowers(6);
  const valid = build(flowers);
  const malformed = inventoryFor(flowers, BASE);
  malformed.stock[flowers[0].sku] = { "3g": -1 };
  const malformedResult = buildOrRetainSmartLineup({ inventory: malformed, flowers, items: [], state: valid.nextState, config: config(flowers), now: BASE });
  assert.equal(malformedResult.servedFrom, "last-good");
  assert.equal(malformedResult.fallbackReason, "MALFORMED_QUANTITY");
  assert.equal(malformedResult.lineup.version, valid.lineup.version);

  const staleNow = new Date(BASE.getTime() + 40 * 60 * 60_000);
  const staleResult = buildOrRetainSmartLineup({ inventory: inventoryFor(flowers, BASE), flowers, items: [], state: valid.nextState, config: config(flowers), now: staleNow });
  assert.equal(staleResult.fallbackReason, "STALE_INVENTORY");

  const partialFlowers = flowers.slice(0, 5);
  const partialNow = new Date(BASE.getTime() + PERIOD_MS);
  const partialResult = buildOrRetainSmartLineup({ inventory: inventoryFor(partialFlowers, partialNow), flowers, items: [], state: valid.nextState, config: config(flowers), now: partialNow });
  assert.equal(partialResult.fallbackReason, "PARTIAL_FLOWER_INVENTORY");
  assert.equal(partialResult.lineup.version, valid.lineup.version);
});

test("duplicate catalog SKUs fail closed, including future duplicates of SKU 373", () => {
  const flowers = [...fixtureFlowers(), flower("373", "AAA+"), flower("373", "AAA+")];
  const inventory = inventoryFor(flowers, BASE);
  assert.throws(() => build(flowers, defaultSmartMenuState(BASE), BASE, inventory, config(flowers)), (error) => error instanceof SmartMenuInputError && error.code === "COVERAGE_AUDIT_FAILED");
});

test("wrong-category flower quantities fail closed", () => {
  const flowers = fixtureFlowers();
  const inventory = inventoryFor(flowers, BASE);
  inventory.stock[flowers[0].sku] = { e: 5 };
  assert.throws(() => build(flowers, defaultSmartMenuState(BASE), BASE, inventory), (error) => error instanceof SmartMenuInputError && error.code === "WRONG_CATEGORY");
});

test("flower/item category overlap fails closed", () => {
  const flowers = fixtureFlowers();
  assert.throws(() => buildSmartLineup({ inventory: inventoryFor(flowers, BASE), flowers, items: [{ sku: flowers[0].sku }], state: defaultSmartMenuState(BASE), config: config(flowers), now: BASE }), (error) => error instanceof SmartMenuInputError && error.code === "CATEGORY_OVERLAP");
});

test("coverage manifest explains item and unknown stock exclusions without publishing them", () => {
  const flowers = fixtureFlowers();
  const inventory = inventoryFor(flowers, BASE);
  inventory.stock["900"] = { e: 3 };
  inventory.stock["999"] = { e: 2 };
  inventory.skuCount = Object.keys(inventory.stock).length;
  const { lineup } = buildSmartLineup({ inventory, flowers, items: [{ sku: "900", category: "EDIBLES" }], state: defaultSmartMenuState(BASE), config: config(flowers), now: BASE });
  assert.equal(lineup.manifest.excludedByReason["non-flower-item"], 1);
  assert.equal(lineup.manifest.excludedByReason["not-in-catalog"], 1);
  assert.equal(lineup.manifest.unexplainedExcludedSkus.length, 0);
  assert.equal(lineup.manifest.missingSkus.length, 0);
  assert.equal(lineup.manifest.duplicateSkus.length, 0);
});

test("engine is deterministic and contains no random, prediction, scoring, or pricing mutation path", async () => {
  const flowers = fixtureFlowers();
  const first = build(flowers);
  const second = build(flowers);
  assert.deepEqual(first.lineup, second.lineup);
  const source = await import("node:fs").then(({ readFileSync }) => readFileSync(new URL("../app/lib/nmgSmartMenu.ts", import.meta.url), "utf8"));
  assert.doesNotMatch(source, /Math\.random|Bayesian|prediction|exposureScore|auto.?pricing/i);
});
