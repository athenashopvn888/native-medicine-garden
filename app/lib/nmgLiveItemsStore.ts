import "server-only";
import { BlobAccessError, BlobPreconditionFailedError, get, head, put } from "@vercel/blob";
import type { LiveItemsSnapshot } from "./nmgSmartMenu";

export const NMG_LIVE_ITEMS_STATE_PATH = "nmg-smart-menu/items/v1.json";
let localSnapshot: LiveItemsSnapshot | null = null;

function blobConfigured() {
  if (process.env.NMG_SMART_MENU_LOCAL_ONLY === "1") return false;
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
}

function blobAuth() {
  // @vercel/blob prefers deployment OIDC over BLOB_READ_WRITE_TOKEN when both
  // exist. This legacy private store is explicitly linked by its existing
  // read-write token, so pass that token to keep writes on the same resource.
  return process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {};
}

function parseSnapshot(value: unknown): LiveItemsSnapshot {
  if (!value || typeof value !== "object") throw new Error("NMG live item state is invalid.");
  const snapshot = value as Partial<LiveItemsSnapshot>;
  if (!snapshot.sourceTimestamp || !snapshot.capturedAt || !Array.isArray(snapshot.items) || snapshot.items.length === 0) {
    throw new Error("NMG live item state is invalid.");
  }
  return snapshot as LiveItemsSnapshot;
}

async function readVersion(): Promise<{ snapshot: LiveItemsSnapshot | null; etag: string | null }> {
  if (!blobConfigured()) return { snapshot: structuredClone(localSnapshot), etag: null };
  const result = await get(NMG_LIVE_ITEMS_STATE_PATH, { access: "private", useCache: false, ...blobAuth() });
  if (!result) return { snapshot: null, etag: null };
  if (result.statusCode !== 200 || !result.stream) throw new Error("NMG live item state could not be read.");
  return { snapshot: parseSnapshot(JSON.parse(await new Response(result.stream).text())), etag: result.blob.etag };
}

export async function readLiveItemsSnapshot() {
  return (await readVersion()).snapshot;
}

export async function writeLiveItemsSnapshot(snapshot: LiveItemsSnapshot) {
  if (!blobConfigured()) {
    localSnapshot = structuredClone(snapshot);
    return;
  }
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const current = await readVersion();
    if (current.snapshot && Date.parse(current.snapshot.sourceTimestamp) > Date.parse(snapshot.sourceTimestamp)) return;
    try {
      if (!current.etag) {
        await put(NMG_LIVE_ITEMS_STATE_PATH, JSON.stringify(snapshot), {
          access: "private",
          contentType: "application/json",
          cacheControlMaxAge: 60,
          allowOverwrite: false,
          ...blobAuth(),
        });
        return;
      }
      const latest = await head(NMG_LIVE_ITEMS_STATE_PATH, blobAuth());
      if (latest.etag.replaceAll('"', "") !== current.etag.replaceAll('"', "")) continue;
      await put(NMG_LIVE_ITEMS_STATE_PATH, JSON.stringify(snapshot), {
        access: "private",
        contentType: "application/json",
        cacheControlMaxAge: 60,
        allowOverwrite: true,
        ifMatch: latest.etag,
        ...blobAuth(),
      });
      return;
    } catch (error) {
      if (error instanceof BlobAccessError || error instanceof BlobPreconditionFailedError) continue;
      throw error;
    }
  }
  throw new Error("NMG live item state was busy.");
}
