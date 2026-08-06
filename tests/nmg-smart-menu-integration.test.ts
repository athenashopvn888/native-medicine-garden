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
});

test("NMG smart-menu state, manifest, and four-hour refresh stay store-scoped", () => {
  const store = read("../app/lib/nmgSmartMenuStore.ts");
  const route = read("../app/api/tv-data/route.ts");
  const refresh = read("../app/api/nmg-smart-menu/refresh/route.ts");
  const vercel = JSON.parse(read("../vercel.json")) as { crons: Array<{ path: string; schedule: string }> };
  assert.match(store, /nmg-smart-menu\/state\/v1\.json/);
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
