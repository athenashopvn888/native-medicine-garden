import "server-only";
import { BlobAccessError, BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { defaultSmartMenuState, type SmartMenuState } from "./nmgSmartMenu";

export const NMG_SMART_MENU_STATE_PATH = "nmg-smart-menu/state/v2.json";
let localState = defaultSmartMenuState();

function blobConfigured() {
  if (process.env.NMG_SMART_MENU_LOCAL_ONLY === "1") return false;
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
}

function blobAuth() {
  // Keep this existing private state on its linked legacy Blob resource even
  // when Vercel also injects deployment OIDC credentials.
  return process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {};
}

function parseState(value: unknown): SmartMenuState {
  if (!value || typeof value !== "object") throw new Error("NMG smart-menu state is invalid.");
  const state = value as Partial<SmartMenuState>;
  if (state.schemaVersion !== 1 || !Array.isArray(state.snapshots) || !state.previousTopByTier || !state.previousMustByTier || !state.topCooldownUntil || !state.mustCooldownUntil) {
    throw new Error("NMG smart-menu state is invalid.");
  }
  return { ...state, liveItems: state.liveItems || null } as SmartMenuState;
}

async function readVersion(): Promise<{ state: SmartMenuState; etag: string | null }> {
  if (!blobConfigured()) return { state: structuredClone(localState), etag: null };
  const result = await get(NMG_SMART_MENU_STATE_PATH, { access: "private", useCache: false, ...blobAuth() });
  if (!result) {
    const state = defaultSmartMenuState();
    try {
      const created = await put(NMG_SMART_MENU_STATE_PATH, JSON.stringify(state), {
        access: "private",
        contentType: "application/json",
        cacheControlMaxAge: 60,
        allowOverwrite: false,
        ...blobAuth(),
      });
      return { state, etag: created.etag };
    } catch (error) {
      if (!(error instanceof BlobAccessError)) throw error;
      return readVersion();
    }
  }
  if (result.statusCode !== 200 || !result.stream) throw new Error("NMG smart-menu state could not be read.");
  return { state: parseState(JSON.parse(await new Response(result.stream).text())), etag: result.blob.etag };
}

export async function readSmartMenuState() {
  return (await readVersion()).state;
}

export async function mutateSmartMenuState<T>(mutator: (draft: SmartMenuState) => T | Promise<T>) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { state, etag } = await readVersion();
    const draft = structuredClone(state);
    const result = await mutator(draft);
    draft.updatedAt = new Date().toISOString();
    if (!blobConfigured()) {
      localState = draft;
      return result;
    }
    try {
      await put(NMG_SMART_MENU_STATE_PATH, JSON.stringify(draft), {
        access: "private",
        contentType: "application/json",
        cacheControlMaxAge: 60,
        allowOverwrite: true,
        ifMatch: String(etag),
        ...blobAuth(),
      });
      return result;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError) {
        await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error("NMG smart-menu state was busy.");
}
