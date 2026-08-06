import "server-only";
import { NMG_SMART_MENU_CONFIG } from "./nmgSmartMenuConfig";
import {
  buildOrRetainSmartLineup,
  SmartMenuInputError,
  type CatalogFlower,
  type CatalogItem,
  type RawInventory,
  type SmartLineup,
  type SmartMenuState,
} from "./nmgSmartMenu";
import { mutateSmartMenuState, readSmartMenuState } from "./nmgSmartMenuStore";

interface CatalogResponse { flowers?: CatalogFlower[]; items?: CatalogItem[] }

export interface SmartMenuResult {
  lineup: SmartLineup;
  servedFrom: "fresh" | "last-good";
  fallbackReason: string | null;
}

let inputCache: { expiresAt: number; promise: Promise<{ inventory: RawInventory; catalog: CatalogResponse }> } | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`NMG inventory endpoint returned HTTP ${response.status}.`);
      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function fetchInputs() {
  const endpoint = process.env.APPS_SCRIPT_URL;
  if (!endpoint) throw new Error("NMG inventory endpoint is not configured.");
  const separator = endpoint.includes("?") ? "&" : "?";
  const base = `${endpoint}${separator}store=NMG01`;
  // The shared Apps Script performs Gmail and Sheet reads. Keep NMG calls
  // sequential so one store refresh cannot contend with itself.
  const inventory = await fetchJson<RawInventory>(`${base}&stock=1`);
  const catalog = await fetchJson<CatalogResponse>(`${base}&catalog=1`);
  if (!Array.isArray(catalog.flowers) || !Array.isArray(catalog.items)) throw new Error("NMG catalog response is incomplete.");
  return { inventory, catalog };
}

async function cachedInputs(force: boolean) {
  const now = Date.now();
  if (!force && inputCache && inputCache.expiresAt > now) return inputCache.promise;
  const promise = fetchInputs();
  inputCache = { expiresAt: now + 4 * 60_000, promise };
  try { return await promise; }
  catch (error) { inputCache = null; throw error; }
}

function copyState(target: SmartMenuState, source: SmartMenuState) {
  target.schemaVersion = source.schemaVersion;
  target.updatedAt = source.updatedAt;
  target.snapshots = source.snapshots;
  target.currentLineup = source.currentLineup;
  target.lastGoodLineup = source.lastGoodLineup;
  target.previousTopByTier = source.previousTopByTier;
  target.previousMustByTier = source.previousMustByTier;
  target.topCooldownUntil = source.topCooldownUntil;
  target.mustCooldownUntil = source.mustCooldownUntil;
  target.rotationOffset = source.rotationOffset;
  target.manifest = source.manifest;
}

function fallback(state: SmartMenuState, error: unknown): SmartMenuResult {
  if (!state.lastGoodLineup) throw error;
  const reason = error instanceof SmartMenuInputError ? error.code : "SOURCE_UNAVAILABLE";
  return { lineup: state.lastGoodLineup, servedFrom: "last-good", fallbackReason: reason };
}

export async function getNmgSmartMenu(options: { force?: boolean } = {}): Promise<SmartMenuResult> {
  const before = await readSmartMenuState();
  try {
    const { inventory, catalog } = await cachedInputs(Boolean(options.force));
    const built = buildOrRetainSmartLineup({
      inventory,
      flowers: catalog.flowers || [],
      items: catalog.items || [],
      state: before,
      config: NMG_SMART_MENU_CONFIG,
    });
    if (built.servedFrom === "last-good") {
      return { lineup: built.lineup, servedFrom: built.servedFrom, fallbackReason: built.fallbackReason };
    }
    if (before.currentLineup?.version === built.lineup.version && before.currentLineup.sourceTimestamp === built.lineup.sourceTimestamp) {
      return { lineup: before.currentLineup, servedFrom: "fresh", fallbackReason: null };
    }
    await mutateSmartMenuState((draft) => copyState(draft, built.nextState));
    return { lineup: built.lineup, servedFrom: "fresh", fallbackReason: null };
  } catch (error) {
    console.warn("[NMG smart menu] rejected source input", error instanceof SmartMenuInputError ? error.code : "SOURCE_UNAVAILABLE");
    return fallback(before, error);
  }
}
