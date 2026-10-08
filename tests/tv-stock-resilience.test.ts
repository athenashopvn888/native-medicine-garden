import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { beforeEach, test } from "node:test";
import { getTvData, resetTvStockCache } from "../app/lib/tvStock.ts";

beforeEach(resetTvStockCache);

const allFlowers = JSON.parse(readFileSync(new URL("../app/lib/flowers.json", import.meta.url), "utf8"));
const allItems = JSON.parse(readFileSync(new URL("../app/lib/items.json", import.meta.url), "utf8"));

function mockFetch({ status = 200, payload, error }: { status?: number; payload?: unknown; error?: Error }) {
  const calls: RequestInit[] = [];
  const fetchImpl = async (_url: string, init?: RequestInit) => {
    calls.push(init || {});
    if (error) throw error;
    return {
      ok: status >= 200 && status < 300,
      status,
      async json() {
        if (payload instanceof Error) throw payload;
        return payload;
      },
    } as Response;
  };
  return { fetchImpl, calls };
}

test("HTML 200, 429, and throws preserve last-good with reason and 60-second cooldown", async () => {
  const payload = {
    flowers: allFlowers.map((flower) => ({ ...flower })),
    items: allItems.map((item) => ({ ...item })),
    stockDate: "2026-10-08",
  };

  for (const failedFetch of [
    mockFetch({ payload: new SyntaxError("Unexpected token '<', HTML error") }),
    mockFetch({ status: 429 }),
    mockFetch({ error: new Error("network down") }),
  ]) {
    resetTvStockCache();
    const seedFetch = mockFetch({ payload });
    const live = await getTvData({
      type: "flowers", staticFlowers: allFlowers, staticItems: allItems,
      fetchImpl: seedFetch.fetchImpl, now: 1_000,
    });
    assert.equal(live.headers["x-tv-data-source"], "live");
    assert.equal(seedFetch.calls[0].cache, "no-store");

    let now = 302_000;
    const fallback = await getTvData({
      type: "flowers", staticFlowers: allFlowers, staticItems: allItems,
      fetchImpl: failedFetch.fetchImpl, now,
    });
    assert.equal(fallback.headers["x-tv-data-source"], "last-good");
    assert.equal(fallback.headers["x-tv-data-as-of"], "2026-10-08");
    assert.ok(fallback.headers["x-tv-data-fallback-reason"]);
    assert.equal(failedFetch.calls.length, 1);

    now += 30_000;
    const cooled = await getTvData({
      type: "flowers", staticFlowers: allFlowers, staticItems: allItems,
      fetchImpl: failedFetch.fetchImpl, now,
    });
    assert.equal(cooled.headers["x-tv-data-source"], "last-good");
    assert.equal(failedFetch.calls.length, 1);

    now += 31_000;
    await getTvData({
      type: "flowers", staticFlowers: allFlowers, staticItems: allItems,
      fetchImpl: failedFetch.fetchImpl, now,
    });
    assert.equal(failedFetch.calls.length, 2);
  }
});

test("a first failure reports its reason and uses the static snapshot", async () => {
  const fetch = mockFetch({ status: 429 });
  const result = await getTvData({
    type: "flowers", staticFlowers: allFlowers, staticItems: allItems,
    fetchImpl: fetch.fetchImpl,
  });
  assert.equal(result.headers["x-tv-data-source"], "static-fallback");
  assert.equal(result.headers["x-tv-data-fallback-reason"], "HTTP 429");
  assert.equal(result.body, allFlowers);
});
