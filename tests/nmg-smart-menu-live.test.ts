import test from "node:test";
import assert from "node:assert/strict";
import { buildSmartLineup, defaultSmartMenuState, type CatalogFlower, type CatalogItem, type RawInventory } from "../app/lib/nmgSmartMenu.ts";
import { NMG_SMART_MENU_CONFIG } from "../app/lib/nmgSmartMenuConfig.ts";
import { selectValidatedLiveItems, type NmgLiveMenuFeed } from "../app/lib/nmgLiveInventory.ts";

const runLive = Boolean(process.env.APPS_SCRIPT_URL);

test("live NMG email inventory and catalog pass the prepublish audit", { skip: !runLive }, async () => {
  const endpoint = process.env.APPS_SCRIPT_URL;
  assert.ok(endpoint, "APPS_SCRIPT_URL is required for the live integration test");
  const separator = endpoint.includes("?") ? "&" : "?";
  const base = `${endpoint}${separator}store=NMG01`;
  const stockResponse = await fetch(`${base}&stock=1`, { signal: AbortSignal.timeout(30_000) });
  const catalogResponse = await fetch(`${base}&catalog=1`, { signal: AbortSignal.timeout(30_000) });
  const liveMenuResponse = await fetch(base, { signal: AbortSignal.timeout(30_000) });
  assert.equal(stockResponse.ok, true);
  assert.equal(catalogResponse.ok, true);
  assert.equal(liveMenuResponse.ok, true);
  const inventory = await stockResponse.json() as RawInventory;
  const catalog = await catalogResponse.json() as { flowers: CatalogFlower[]; items: CatalogItem[] };
  const liveMenu = await liveMenuResponse.json() as NmgLiveMenuFeed;
  const liveItems = selectValidatedLiveItems({ inventory, catalogFlowers: catalog.flowers, catalogItems: catalog.items, liveMenu });
  assert.ok(liveItems.length > 0);
  assert.equal(catalog.flowers.filter((flower) => flower.sku === "373").length, 1);
  const { lineup } = buildSmartLineup({
    inventory,
    flowers: catalog.flowers,
    items: catalog.items,
    state: defaultSmartMenuState(),
    config: NMG_SMART_MENU_CONFIG,
  });
  assert.equal(lineup.manifest.accepted, true);
  assert.equal(lineup.manifest.missingSkus.length, 0);
  assert.equal(lineup.manifest.duplicateSkus.length, 0);
  assert.equal(lineup.manifest.wrongCategorySkus.length, 0);
  assert.equal(lineup.manifest.outOfStockIncludedSkus.length, 0);
  assert.equal(lineup.manifest.unexplainedExcludedSkus.length, 0);
  assert.equal(lineup.manifest.includedSkus, lineup.manifest.inputFlowerStockSkus);
  assert.equal(lineup.manifest.eligibleCycleSkus.length, lineup.manifest.includedSkus);
  assert.equal(lineup.manifest.currentlyVisibleCount, lineup.manifest.currentlyVisibleSkus.length);
  for (const tier of Object.values(lineup.tiers)) {
    assert.ok(tier.lockedProducts.length <= NMG_SMART_MENU_CONFIG.pageSize, `${tier.tier} locked rows exceed visible capacity`);
    assert.deepEqual(
      tier.lockedProducts.map((product) => product.smartBadge),
      tier.lockedProducts.map((product) => product.smartBadge).sort((a, b) => ["SALE", "TOP PICK", "MUST TRY"].indexOf(a) - ["SALE", "TOP PICK", "MUST TRY"].indexOf(b)),
    );
    assert.ok(tier.visibleProducts.length <= NMG_SMART_MENU_CONFIG.pageSize);
  }
});
