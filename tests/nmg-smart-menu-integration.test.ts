import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("NMG TV keeps locked rows fixed and changes only deterministic regular windows every 30 minutes", () => {
  const source = read("../app/tv/page.tsx");
  assert.match(source, /kind:\s*"nmg-smart-lineup"/);
  assert.match(source, /source\.lockedProducts/);
  assert.match(source, /source\.regularProducts/);
  assert.match(source, /selectRegularWindow\(lineup\.regularProducts, lineup\.regularCapacity, regularBucket\)/);
  assert.match(source, /nextBoundary.*NMG_REGULAR_WINDOW_MS/);
  assert.doesNotMatch(source, /SMART_PAGE_INTERVAL_MS|25_000|pageIndexes|setInterval\([^)]*page/i);
  assert.doesNotMatch(source, /Math\.random\(\).*window/i);
});

test("TV2 item behavior is isolated from the NMG flower priority engine", () => {
  const source = read("../app/tv2/page.tsx");
  assert.match(source, /fetch\("\/api\/tv-data\?type=items"\)/);
  assert.doesNotMatch(source, /nmg-smart-lineup|nmgSmartMenu|NMG_REGULAR_WINDOW_MS/);
  assert.match(source, /5\*60\*1000/);
});

test("NMG items use the same live email feed and durable last-good state as flowers", () => {
  const route = read("../app/api/tv-data/route.ts");
  const service = read("../app/lib/nmgSmartMenuService.ts");
  const state = read("../app/lib/nmgSmartMenu.ts");
  const itemStore = read("../app/lib/nmgLiveItemsStore.ts");
  assert.doesNotMatch(route, /allItems/);
  assert.match(route, /result\.items/);
  assert.match(route, /x-tv-data-source/);
  assert.match(route, /x-tv-data-as-of/);
  assert.doesNotMatch(service, /fetchJson<[^>]*LiveMenu[^>]*>\(base\)/);
  assert.match(service, /selectValidatedLiveItems/);
  assert.match(state, /liveItems: LiveItemsSnapshot \| null/);
  assert.match(itemStore, /nmg-smart-menu\/items\/v1\.json/);
  assert.match(service, /writeLiveItemsSnapshot/);
  assert.match(service, /try\s*\{[\s\S]*await writeLiveItemsSnapshot\(liveItemsSnapshot\);[\s\S]*\}\s*catch/);
  assert.match(service, /items: liveItems, itemsSource: "live"/);
  assert.match(service, /try\s*\{[\s\S]*await mutateSmartMenuState\([\s\S]*\}\s*catch\s*\{[\s\S]*flower LKG persistence unavailable/);
});

test("NMG smart-menu state, manifest, and four-hour refresh stay store-scoped", () => {
  const store = read("../app/lib/nmgSmartMenuStore.ts");
  const route = read("../app/api/tv-data/route.ts");
  const refresh = read("../app/api/nmg-smart-menu/refresh/route.ts");
  const vercel = JSON.parse(read("../vercel.json")) as { crons: Array<{ path: string; schedule: string }> };
  assert.match(store, /nmg-smart-menu\/state\/v2\.json/);
  assert.match(route, /type === "smart-manifest"/);
  assert.match(route, /kind: "nmg-smart-lineup"/);
  assert.match(refresh, /CRON_SECRET/);
  assert.deepEqual(vercel.crons.find((cron) => cron.path === "/api/nmg-smart-menu/refresh"), {
    path: "/api/nmg-smart-menu/refresh",
    schedule: "5 */4 * * *",
  });
});

test("standalone Apps Script and ADC are absent from the implementation diff surface", () => {
  const service = read("../app/lib/nmgSmartMenuService.ts");
  assert.match(service, /store=NMG01/);
  assert.doesNotMatch(service, /ADC|doPost|SpreadsheetApp|GmailApp/);
});

test("tier and category pages use the complete shared live menu directly", () => {
  const service = read("../app/lib/nmgSmartMenuService.ts");
  const tier = read("../app/[tier]/page.tsx");
  const category = read("../app/items/[category]/page.tsx");
  const flowerDetail = read("../app/flower/[slug]/page.tsx");
  const itemDetail = read("../app/item/[slug]/page.tsx");
  assert.match(service, /getNmgCompleteMenuProducts/);
  assert.match(service, /lockedProducts/);
  assert.match(service, /regularProducts/);
  assert.match(tier, /getNmgCompleteMenuProducts/);
  assert.match(category, /getNmgCompleteMenuProducts/);
  assert.doesNotMatch(tier, /getFlowersByTier/);
  assert.doesNotMatch(category, /getItemsByCategory/);
  assert.doesNotMatch(tier, /fetch\(["'`]\/api\/tv-data/);
  assert.doesNotMatch(category, /fetch\(["'`]\/api\/tv-data/);
  assert.match(tier, /data-inventory-version/);
  assert.match(category, /data-inventory-version/);
  assert.match(service, /getNmgFlowerDetail/);
  assert.match(service, /getNmgItemDetail/);
  assert.match(flowerDetail, /getNmgFlowerDetail/);
  assert.match(itemDetail, /getNmgItemDetail/);
  assert.match(service, /allFlowers\.find/);
  assert.match(service, /allItems\.find/);
});
