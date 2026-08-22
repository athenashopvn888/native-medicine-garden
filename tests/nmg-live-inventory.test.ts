import test from "node:test";
import assert from "node:assert/strict";
import { selectValidatedLiveItems } from "../app/lib/nmgLiveInventory.ts";
import { SmartMenuInputError, type CatalogItem, type RawInventory } from "../app/lib/nmgSmartMenu.ts";

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
const items = [
  { sku: "900", name: "Unavailable", category: "EDIBLES", price: "$10" },
  { sku: "900,901", name: "Grouped item", category: "EDIBLES", price: "$15" },
  { sku: "902", name: "Single item", category: "PREROLLS", price: 12 },
] as CatalogItem[];

test("live email menu keeps a grouped item when any listed SKU is in stock", () => {
  const selected = selectValidatedLiveItems({
    inventory,
    catalogItems: items,
  });
  assert.deepEqual(selected, items.slice(1));
});

test("distinct display products may intentionally share one grouped SKU set", () => {
  const shared = [
    { sku: "900,901", name: "First display", category: "EDIBLES", price: "$15" },
    { sku: "900,901", name: "Second display", category: "EDIBLES", price: "$15" },
    items[2],
  ] as CatalogItem[];
  const selected = selectValidatedLiveItems({
    inventory,
    catalogItems: shared,
  });
  assert.equal(selected.length, 3);
});

test("an exact duplicate live display row fails closed", () => {
  assert.throws(() => selectValidatedLiveItems({
    inventory,
    catalogItems: [items[1], items[1], items[2]],
  }), (error) => error instanceof SmartMenuInputError && error.code === "LIVE_ITEM_INVALID");
});

test("a stock-qualified row with an invalid SKU fails closed", () => {
  const invalidInventory = structuredClone(inventory);
  invalidInventory.stock.bad = { e: 1 };
  assert.throws(() => selectValidatedLiveItems({
    inventory: invalidInventory,
    catalogItems: [{ sku: "bad", name: "Invalid", category: "EDIBLES", price: "$10" }, ...items],
  }), (error) => error instanceof SmartMenuInputError && error.code === "LIVE_ITEM_INVALID");
});

test("a stock-qualified row with an invalid price fails closed", () => {
  assert.throws(() => selectValidatedLiveItems({
    inventory,
    catalogItems: [{ ...items[2], price: "call" }, items[1]],
  }), (error) => error instanceof SmartMenuInputError && error.code === "LIVE_ITEM_INVALID_PRICE");
});

test("an item catalog with no live products fails closed", () => {
  assert.throws(() => selectValidatedLiveItems({
    inventory,
    catalogItems: [items[0]],
  }), (error) => error instanceof SmartMenuInputError && error.code === "NO_LIVE_ITEMS");
});
