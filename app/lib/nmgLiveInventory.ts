import {
  SmartMenuInputError,
  type CatalogFlower,
  type CatalogItem,
  type RawInventory,
} from "./nmgSmartMenu.ts";

export interface NmgLiveMenuFeed {
  storeCode?: string;
  stockDate?: string;
  flowers?: CatalogFlower[];
  items?: CatalogItem[];
}

function skuParts(value: unknown) {
  return String(value || "").split(",").map((sku) => sku.trim()).filter(Boolean);
}

function hasPositiveStock(inventory: RawInventory, sku: string) {
  return Object.values(inventory.stock[sku] || {}).some((quantity) => quantity > 0);
}

function assertSameSet(actual: Set<string>, expected: Set<string>, code: string, message: string) {
  if (actual.size !== expected.size || [...actual].some((sku) => !expected.has(sku))) {
    throw new SmartMenuInputError(code, message);
  }
}

/**
 * Reconciles the combined email-menu response to the same stock and catalog
 * snapshots used by the smart flower lineup. Grouped item rows remain visible
 * when at least one of their listed SKUs has positive stock.
 */
export function selectValidatedLiveItems(args: {
  inventory: RawInventory;
  catalogFlowers: CatalogFlower[];
  catalogItems: CatalogItem[];
  liveMenu: NmgLiveMenuFeed;
}): CatalogItem[] {
  const { inventory, catalogFlowers, catalogItems, liveMenu } = args;
  if (liveMenu.storeCode && liveMenu.storeCode !== "NMG01") {
    throw new SmartMenuInputError("LIVE_MENU_STORE_MISMATCH", "Live menu store code does not match NMG01.");
  }
  if (liveMenu.stockDate !== inventory.date) {
    throw new SmartMenuInputError("LIVE_MENU_TIMESTAMP_MISMATCH", "Live menu and inventory email timestamps do not match.");
  }
  if (!Array.isArray(liveMenu.flowers) || !Array.isArray(liveMenu.items) || liveMenu.items.length === 0) {
    throw new SmartMenuInputError("LIVE_MENU_INCOMPLETE", "Live menu collections are incomplete.");
  }

  const expectedFlowerSkus = new Set(catalogFlowers.map((flower) => String(flower.sku || "").trim()).filter((sku) => sku && hasPositiveStock(inventory, sku)));
  const liveFlowerSkus = new Set(liveMenu.flowers.map((flower) => String(flower.sku || "").trim()).filter(Boolean));
  assertSameSet(liveFlowerSkus, expectedFlowerSkus, "LIVE_FLOWER_COVERAGE_MISMATCH", "Live flower menu does not match the stock-qualified catalog.");

  const catalogItemSkus = new Set(catalogItems.flatMap((item) => skuParts(item.sku)));
  const positiveCatalogItemSkus = new Set([...catalogItemSkus].filter((sku) => hasPositiveStock(inventory, sku)));
  const coveredPositiveSkus = new Set<string>();
  const seenRows = new Set<string>();

  for (const item of liveMenu.items) {
    const parts = skuParts(item.sku);
    const name = String(item.name || "").trim();
    // The source intentionally has a small number of distinct display products
    // sharing a grouped SKU set (for example two GRABBA names). Treat only the
    // same SKU, category, and display name as a duplicate row.
    const identity = `${parts.join(",")}\u0000${String(item.category || "").trim().toUpperCase()}\u0000${name.toUpperCase()}`;
    if (!name || parts.length === 0 || parts.some((sku) => !/^\d+$/.test(sku) || !catalogItemSkus.has(sku)) || seenRows.has(identity)) {
      throw new SmartMenuInputError("LIVE_ITEM_INVALID", "Live item menu contains an invalid or duplicate row.");
    }
    seenRows.add(identity);
    const positiveParts = parts.filter((sku) => hasPositiveStock(inventory, sku));
    if (positiveParts.length === 0) {
      throw new SmartMenuInputError("OUT_OF_STOCK_ITEM_INCLUDED", `Live item row ${item.sku} has no positive inventory.`);
    }
    positiveParts.forEach((sku) => coveredPositiveSkus.add(sku));
  }

  assertSameSet(coveredPositiveSkus, positiveCatalogItemSkus, "LIVE_ITEM_COVERAGE_MISMATCH", "Live item menu does not cover every stock-qualified catalog item SKU.");
  return structuredClone(liveMenu.items);
}
