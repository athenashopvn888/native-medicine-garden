import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrRetainSmartLineup,
  buildSmartLineup,
  defaultSmartMenuState,
  materializeSmartLineup,
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
    price14g: { regular: 60, sale: null },
    price28g: { regular: 100, sale: null },
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
    regularWindowMinutes: 30,
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
  return NMG_SMART_TIERS.flatMap((tier) => [...lineup.tiers[tier].lockedProducts, ...lineup.tiers[tier].regularProducts]);
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

test("locked rows stay fixed as all ranked sales, one TOP PICK, then one MUST TRY", () => {
  const flowers = fixtureFlowers(8);
  const built = build(flowers);
  for (const tier of NMG_SMART_TIERS) {
    const locked = built.lineup.tiers[tier].lockedProducts;
    assert.deepEqual(locked.map((row) => row.smartBadge), ["SALE", "TOP PICK"]);
    assert.deepEqual(locked.filter((row) => row.smartBadge === "SALE").map((row) => row.saleRank), [NMG_SMART_TIERS.indexOf(tier) + 1]);
    const later = materializeSmartLineup(built.lineup, new Date(BASE.getTime() + 29 * 60_000 + 59_000));
    assert.deepEqual(later.tiers[tier].lockedProducts.map((row) => row.sku), locked.map((row) => row.sku));
    assert.deepEqual(later.tiers[tier].visibleProducts.slice(0, locked.length).map((row) => row.sku), locked.map((row) => row.sku));
  }
});

test("locked priority overflow rejects instead of hiding or rotating a sale", () => {
  const sales = Array.from({ length: 11 }, (_, index) => flower(String(600 + index), "EXOTIC", { sale: true, saleRank: index + 1 }));
  const flowers = [...sales, ...NMG_SMART_TIERS.slice(1).map((tier) => flower(String(tierBases[tier] + 90), tier))];
  assert.throws(
    () => build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), config(flowers)),
    (error) => error instanceof SmartMenuInputError && error.code === "LOCKED_CAPACITY_EXCEEDED",
  );
});

test("an unranked sale is accepted fresh, warned, and kept out of every locked promo lane", () => {
  const flowers = [flower("501", "EXOTIC", { sale: true }), ...NMG_SMART_TIERS.slice(1).map((tier) => flower(String(tierBases[tier] + 1), tier))];
  const { lineup } = build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), config(flowers, { saleRanks: {} }));
  const product = allProducts(lineup).find((row) => row.sku === "501");
  assert.equal(lineup.manifest.accepted, true);
  assert.deepEqual(lineup.manifest.unrankedSaleSkus, ["501"]);
  assert.deepEqual(lineup.manifest.warnings, [{ code: "UNRANKED_SALE_SKUS", skus: ["501"] }]);
  assert.equal(product?.isSale, true);
  assert.equal(product?.smartBadge, "REGULAR");
  assert.equal(product?.saleRank, null);
  assert.ok(lineup.tiers.EXOTIC.regularProducts.some((row) => row.sku === "501"));
  assert.ok(lineup.tiers.EXOTIC.lockedProducts.every((row) => row.sku !== "501"));
  assert.ok(allProducts(lineup).filter((row) => row.sku === "501").every((row) => !row.isHot && !row.isMustTry));
});

test("all nine current unranked sale SKUs are accepted without synthetic rank or promo placement", () => {
  const currentUnranked = ["207", "213", "215", "323", "372", "380", "393", "476", "515"];
  const flowers = [
    ...currentUnranked.map((sku, index) => flower(sku, NMG_SMART_TIERS[index % NMG_SMART_TIERS.length], { sale: true })),
    ...NMG_SMART_TIERS.map((tier, index) => flower(String(800 + index), tier)),
  ];
  const { lineup } = build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), config(flowers, { saleRanks: {} }));
  assert.equal(lineup.manifest.accepted, true);
  assert.deepEqual(lineup.manifest.unrankedSaleSkus, currentUnranked);
  assert.deepEqual(lineup.manifest.warnings, [{ code: "UNRANKED_SALE_SKUS", skus: currentUnranked }]);
  const products = allProducts(lineup).filter((row) => currentUnranked.includes(row.sku));
  assert.equal(products.length, currentUnranked.length);
  assert.ok(products.every((row) => row.isSale && row.smartBadge === "REGULAR" && row.saleRank === null && !row.isHot && !row.isMustTry));
  assert.ok(NMG_SMART_TIERS.flatMap((tier) => lineup.tiers[tier].lockedProducts).every((row) => !currentUnranked.includes(row.sku)));
});

test("configured sale ranks override catalog drift and preserve locked rank positions", () => {
  const flowers = [
    flower("501", "EXOTIC", { sale: true, saleRank: 99 }),
    flower("502", "EXOTIC", { sale: true, saleRank: 1 }),
    ...NMG_SMART_TIERS.slice(1).map((tier) => flower(String(tierBases[tier] + 1), tier)),
  ];
  const cfg = config(flowers, { saleRanks: { "501": 1, "502": 2 } });
  const { lineup } = build(flowers, defaultSmartMenuState(BASE), BASE, inventoryFor(flowers, BASE), cfg);
  assert.deepEqual(
    lineup.tiers.EXOTIC.lockedProducts.filter((row) => row.smartBadge === "SALE").map((row) => [row.sku, row.saleRank]),
    [["501", 1], ["502", 2]],
  );
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

test("regular windows are stable for 30 minutes, advance exactly at the boundary, and cover all before repeat", () => {
  const flowers = fixtureFlowers(14);
  const built = build(flowers);
  const beforeBoundary = materializeSmartLineup(built.lineup, new Date(BASE.getTime() + 29 * 60_000 + 59_999));
  const atBoundary = materializeSmartLineup(built.lineup, new Date(BASE.getTime() + 30 * 60_000));

  for (const tier of NMG_SMART_TIERS) {
    const initial = built.lineup.tiers[tier];
    assert.deepEqual(beforeBoundary.tiers[tier].visibleProducts.map((row) => row.sku), initial.visibleProducts.map((row) => row.sku));
    assert.deepEqual(beforeBoundary.tiers[tier].lockedProducts.map((row) => row.sku), atBoundary.tiers[tier].lockedProducts.map((row) => row.sku));
    assert.notDeepEqual(
      beforeBoundary.tiers[tier].visibleProducts.map((row) => row.sku),
      atBoundary.tiers[tier].visibleProducts.map((row) => row.sku),
    );

    const seen: string[] = [];
    const count = initial.regularWindowCount;
    for (let index = 0; index < count; index += 1) {
      const view = materializeSmartLineup(built.lineup, new Date(BASE.getTime() + index * 30 * 60_000));
      const regular = view.tiers[tier].visibleProducts.slice(view.tiers[tier].lockedProducts.length);
      for (const product of regular) {
        assert.equal(seen.includes(product.sku), false, `${tier} repeated ${product.sku} before full coverage`);
        seen.push(product.sku);
      }
    }
    assert.deepEqual([...seen].sort(), initial.regularProducts.map((row) => row.sku).sort());

    const repeatedWindow = materializeSmartLineup(built.lineup, new Date(BASE.getTime() + count * 30 * 60_000));
    const firstRegular = initial.visibleProducts.slice(initial.lockedProducts.length).map((row) => row.sku);
    const repeatedRegular = repeatedWindow.tiers[tier].visibleProducts.slice(initial.lockedProducts.length).map((row) => row.sku);
    assert.deepEqual([...repeatedRegular].sort(), [...firstRegular].sort());
    if (firstRegular.length > 1) assert.notDeepEqual(repeatedRegular, firstRegular);
  }
});

test("manifest separates complete eligible-cycle coverage from the current visible window", () => {
  const flowers = fixtureFlowers(14);
  const { lineup } = build(flowers);
  assert.equal(lineup.manifest.includedSkus, flowers.length);
  assert.equal(lineup.manifest.eligibleCycleSkus.length, flowers.length);
  assert.equal(lineup.manifest.currentlyVisibleCount, lineup.manifest.currentlyVisibleSkus.length);
  assert.ok(lineup.manifest.currentlyVisibleCount < lineup.manifest.includedSkus);
  assert.equal(lineup.manifest.missingSkus.length, 0);
  for (const sku of lineup.manifest.currentlyVisibleSkus) assert.ok(lineup.manifest.eligibleCycleSkus.includes(sku));
});

test("wrong-store, malformed, invalid-price, stale, and partial inputs retain the durable last-known-good lineup", () => {
  const flowers = fixtureFlowers(6);
  const valid = build(flowers);
  const malformed = inventoryFor(flowers, BASE);
  malformed.stock[flowers[0].sku] = { "3g": -1 };
  const malformedResult = buildOrRetainSmartLineup({ inventory: malformed, flowers, items: [], state: valid.nextState, config: config(flowers), now: BASE });
  assert.equal(malformedResult.servedFrom, "last-good");
  assert.equal(malformedResult.fallbackReason, "MALFORMED_QUANTITY");
  assert.equal(malformedResult.lineup.version, valid.lineup.version);

  const wrongStore = inventoryFor(flowers, BASE);
  wrongStore.storeCode = "PL601";
  const wrongStoreResult = buildOrRetainSmartLineup({ inventory: wrongStore, flowers, items: [], state: valid.nextState, config: config(flowers), now: BASE });
  assert.equal(wrongStoreResult.servedFrom, "last-good");
  assert.equal(wrongStoreResult.fallbackReason, "STORE_MISMATCH");

  const invalidPriceFlowers = structuredClone(flowers);
  invalidPriceFlowers[0].price3g = { regular: "invalid", sale: null };
  const invalidPriceResult = buildOrRetainSmartLineup({ inventory: inventoryFor(invalidPriceFlowers, BASE), flowers: invalidPriceFlowers, items: [], state: valid.nextState, config: config(flowers), now: BASE });
  assert.equal(invalidPriceResult.servedFrom, "last-good");
  assert.equal(invalidPriceResult.fallbackReason, "INVALID_FLOWER_PRICE");

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
