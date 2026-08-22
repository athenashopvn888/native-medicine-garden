import test from "node:test";
import assert from "node:assert/strict";
import { BlobAccessError, BlobPreconditionFailedError } from "@vercel/blob";
import {
  LiveItemsSnapshotConflictError,
  liveItemsContentHash,
  persistLiveItemsSnapshot,
  type LiveItemsPersistenceOperations,
} from "../app/lib/nmgLiveItemsPersistence.ts";
import type { LiveItemsSnapshot } from "../app/lib/nmgSmartMenu.ts";

const OLD = "2026-08-06T00:35:48.000Z";
const FRESH = "2026-08-22T02:38:49.000Z";
const item = (sku: string, name = `ITEM ${sku}`) => ({ sku, name, category: "EDIBLES", price: "$10" });
const snapshot = (sourceTimestamp: string, items = [item("900")]): LiveItemsSnapshot => ({
  sourceTimestamp,
  capturedAt: "2026-08-22T04:00:00.000Z",
  items,
});

function operations(overrides: Partial<LiveItemsPersistenceOperations> = {}) {
  let creates = 0;
  let overwrites = 0;
  const sleeps: number[] = [];
  const ops: LiveItemsPersistenceOperations = {
    readVersion: async () => ({ snapshot: snapshot(OLD), etag: "old-etag" }),
    create: async () => { creates += 1; },
    overwrite: async () => { overwrites += 1; },
    sleep: async (milliseconds) => { sleeps.push(milliseconds); },
    ...overrides,
  };
  return { ops, counts: () => ({ creates, overwrites, sleeps }) };
}

test("BlobAccessError fails immediately so the caller can retain LKG", async () => {
  let attempts = 0;
  const fixture = operations({ overwrite: async () => { attempts += 1; throw new BlobAccessError(); } });
  await assert.rejects(() => persistLiveItemsSnapshot(snapshot(FRESH), fixture.ops), BlobAccessError);
  assert.equal(attempts, 1);
  assert.deepEqual(fixture.counts().sleeps, []);
});

test("BlobPreconditionFailedError retries with bounded deterministic backoff", async () => {
  let attempts = 0;
  const fixture = operations({ overwrite: async () => {
    attempts += 1;
    if (attempts === 1) throw new BlobPreconditionFailedError();
  } });
  assert.equal(await persistLiveItemsSnapshot(snapshot(FRESH), fixture.ops), "written");
  assert.equal(attempts, 2);
  assert.deepEqual(fixture.counts().sleeps, [25]);
});

test("concurrent identical same-version content is a no-op", async () => {
  const next = snapshot(FRESH, [item("900"), item("901")]);
  const fixture = operations({ readVersion: async () => ({ snapshot: structuredClone(next), etag: "fresh-etag" }) });
  assert.equal(await persistLiveItemsSnapshot(next, fixture.ops), "identical-noop");
  assert.deepEqual(fixture.counts(), { creates: 0, overwrites: 0, sleeps: [] });
});

test("same timestamp with a different full catalog hash fails closed", async () => {
  const current = snapshot(FRESH, [item("900")]);
  const next = snapshot(FRESH, [item("900"), item("901")]);
  assert.notEqual(liveItemsContentHash(current), liveItemsContentHash(next));
  const fixture = operations({ readVersion: async () => ({ snapshot: current, etag: "fresh-etag" }) });
  await assert.rejects(() => persistLiveItemsSnapshot(next, fixture.ops), LiveItemsSnapshotConflictError);
  assert.deepEqual(fixture.counts(), { creates: 0, overwrites: 0, sleeps: [] });
});

test("newer stored source stays monotonic and is never overwritten", async () => {
  const fixture = operations({ readVersion: async () => ({ snapshot: snapshot(FRESH), etag: "fresh-etag" }) });
  assert.equal(await persistLiveItemsSnapshot(snapshot(OLD), fixture.ops), "newer-noop");
  assert.deepEqual(fixture.counts(), { creates: 0, overwrites: 0, sleeps: [] });
});
