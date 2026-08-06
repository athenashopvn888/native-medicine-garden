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

/**
 * Selects live item rows directly from the authoritative email inventory and
 * catalog snapshots. This produces the same rows as the combined menu feed
 * without a redundant third source request. Grouped rows remain visible when
 * at least one listed SKU has positive stock.
 */
export function selectValidatedLiveItems(args: {
  inventory: RawInventory;
  catalogItems: CatalogItem[];
}): CatalogItem[] {
  const { inventory, catalogItems } = args;
  if (!Array.isArray(catalogItems) || catalogItems.length === 0) {
    throw new SmartMenuInputError("LIVE_ITEM_CATALOG_INCOMPLETE", "Live item catalog is incomplete.");
  }
  const seenRows = new Set<string>();
  const liveItems: CatalogItem[] = [];

  for (const item of catalogItems) {
    const parts = skuParts(item.sku);
    const name = String(item.name || "").trim();
    if (!parts.some((sku) => hasPositiveStock(inventory, sku))) continue;
    // The source intentionally has a small number of distinct display products
    // sharing a grouped SKU set (for example two GRABBA names). Treat only the
    // same SKU, category, and display name as a duplicate row.
    const identity = `${parts.join(",")}\u0000${String(item.category || "").trim().toUpperCase()}\u0000${name.toUpperCase()}`;
    if (!name || parts.length === 0 || parts.some((sku) => !/^\d+$/.test(sku)) || seenRows.has(identity)) {
      throw new SmartMenuInputError("LIVE_ITEM_INVALID", "Live item menu contains an invalid or duplicate row.");
    }
    seenRows.add(identity);
    liveItems.push(item);
  }

  if (liveItems.length === 0) throw new SmartMenuInputError("NO_LIVE_ITEMS", "No live NMG item rows are available.");
  return structuredClone(liveItems);
}
