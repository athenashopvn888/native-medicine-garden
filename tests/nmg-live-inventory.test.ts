import test from "node:test";
import assert from "node:assert/strict";
import { selectValidatedLiveItems } from "../app/lib/nmgLiveInventory.ts";
import { SmartMenuInputError, type CatalogFlower, type CatalogItem, type RawInventory } from "../app/lib/nmgSmartMenu.ts";

const inventory: RawInventory = {
  storeCode: "NMG01",
  date: "2026-08-06T00:35:48.000Z",
  skuCount: 4,
  stock: {
    "501": { "3g": 4 },
    "900": { e: 0 },
    "901": { e: 8 },
    "902": { e: 3 },
  },
};
const flowers = [{ sku: "501", name: "Flower", tier: "EXOTIC" }] as CatalogFlower[];
const items = [
  { sku: "900,901", name: "Grouped item", category: "EDIBLES" },
  { sku: "902", name: "Single item", category: "PREROLLS" },
] as CatalogItem[];

test("live email menu keeps a grouped item when any listed SKU is in stock", () => {
  const selected = selectValidatedLiveItems({
    inventory,
    catalogFlowers: flowers,
    catalogItems: items,
    liveMenu: { storeCode: "NMG01", stockDate: inventory.date, flowers, items },
  });
  assert.deepEqual(selected, items);
});

test("distinct display products may intentionally share one grouped SKU set", () => {
  const shared = [
    { sku: "900,901", name: "First display", category: "EDIBLES" },
    { sku: "900,901", name: "Second display", category: "EDIBLES" },
    items[1],
  ] as CatalogItem[];
  const selected = selectValidatedLiveItems({
    inventory,
    catalogFlowers: flowers,
    catalogItems: shared,
    liveMenu: { storeCode: "NMG01", stockDate: inventory.date, flowers, items: shared },
  });
  assert.equal(selected.length, 3);
});

test("live item rows must cover all positive catalog item SKUs", () => {
  assert.throws(() => selectValidatedLiveItems({
    inventory,
    catalogFlowers: flowers,
    catalogItems: items,
    liveMenu: { storeCode: "NMG01", stockDate: inventory.date, flowers, items: items.slice(0, 1) },
  }), (error) => error instanceof SmartMenuInputError && error.code === "LIVE_ITEM_COVERAGE_MISMATCH");
});

test("live item rows cannot include a fully out-of-stock product", () => {
  assert.throws(() => selectValidatedLiveItems({
    inventory,
    catalogFlowers: flowers,
    catalogItems: items,
    liveMenu: {
      storeCode: "NMG01",
      stockDate: inventory.date,
      flowers,
      items: [{ sku: "900", name: "Unavailable", category: "EDIBLES" }, ...items],
    },
  }), (error) => error instanceof SmartMenuInputError && error.code === "OUT_OF_STOCK_ITEM_INCLUDED");
});

test("combined menu timestamp and flower coverage must match the email inventory", () => {
  assert.throws(() => selectValidatedLiveItems({
    inventory,
    catalogFlowers: flowers,
    catalogItems: items,
    liveMenu: { storeCode: "NMG01", stockDate: "2026-08-05T00:00:00.000Z", flowers: [], items },
  }), (error) => error instanceof SmartMenuInputError && error.code === "LIVE_MENU_TIMESTAMP_MISMATCH");
});
