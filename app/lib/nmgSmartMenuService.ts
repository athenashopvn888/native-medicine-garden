import "server-only";
import { NMG_SMART_MENU_CONFIG } from "./nmgSmartMenuConfig";
import {
  buildOrRetainSmartLineup,
  materializeSmartLineup,
  SmartMenuInputError,
  type CatalogFlower,
  type CatalogItem,
  type RawInventory,
  type SmartLineup,
  type SmartMenuState,
} from "./nmgSmartMenu";
import { mutateSmartMenuState, readSmartMenuState } from "./nmgSmartMenuStore";
import { selectValidatedLiveItems } from "./nmgLiveInventory";
import { readLiveItemsSnapshot, writeLiveItemsSnapshot } from "./nmgLiveItemsStore";

interface CatalogResponse { flowers?: CatalogFlower[]; items?: CatalogItem[] }

export interface SmartMenuResult {
  lineup: SmartLineup;
  items: CatalogItem[];
  itemsSource: "live" | "last-good" | "unavailable";
  itemsSourceTimestamp: string | null;
  servedFrom: "fresh" | "last-good";
  fallbackReason: string | null;
}

let inputCache: { expiresAt: number; promise: ReturnType<typeof fetchInputs> } | null = null;

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

function fallback(state: SmartMenuState, storedItems: SmartMenuState["liveItems"], error: unknown, now: Date): SmartMenuResult {
  if (!state.lastGoodLineup) throw error;
  const reason = error instanceof SmartMenuInputError ? error.code : "SOURCE_UNAVAILABLE";
  const items = storedItems || state.liveItems;
  return {
    lineup: materializeSmartLineup(state.lastGoodLineup, now),
    items: items?.items || [],
    itemsSource: items ? "last-good" : "unavailable",
    itemsSourceTimestamp: items?.sourceTimestamp || null,
    servedFrom: "last-good",
    fallbackReason: reason,
  };
}

export async function getNmgSmartMenu(options: { force?: boolean } = {}): Promise<SmartMenuResult> {
  const now = new Date();
  const [before, storedItems] = await Promise.all([readSmartMenuState(), readLiveItemsSnapshot()]);
  try {
    const { inventory, catalog } = await cachedInputs(Boolean(options.force));
    const liveItems = selectValidatedLiveItems({
      inventory,
      catalogItems: catalog.items || [],
    });
    const built = buildOrRetainSmartLineup({
      inventory,
      flowers: catalog.flowers || [],
      items: catalog.items || [],
      state: before,
      config: NMG_SMART_MENU_CONFIG,
      now,
    });
    if (built.servedFrom === "last-good") {
      return fallback(before, storedItems, new SmartMenuInputError(built.fallbackReason || "SOURCE_REJECTED", "NMG source input was rejected."), now);
    }
    const liveItemsSnapshot = { sourceTimestamp: inventory.date, capturedAt: now.toISOString(), items: liveItems };
    try {
      await writeLiveItemsSnapshot(liveItemsSnapshot);
    } catch {
      console.warn("[NMG smart menu] live item LKG persistence unavailable");
    }
    if (before.currentLineup?.schemaVersion === 2 && before.currentLineup.version === built.lineup.version && before.currentLineup.sourceTimestamp === built.lineup.sourceTimestamp) {
      return { lineup: materializeSmartLineup(before.currentLineup, now), items: liveItems, itemsSource: "live", itemsSourceTimestamp: inventory.date, servedFrom: "fresh", fallbackReason: null };
    }
    await mutateSmartMenuState((draft) => copyState(draft, built.nextState));
    return { lineup: built.lineup, items: liveItems, itemsSource: "live", itemsSourceTimestamp: inventory.date, servedFrom: "fresh", fallbackReason: null };
  } catch (error) {
    console.warn("[NMG smart menu] rejected source input", error instanceof SmartMenuInputError ? error.code : "SOURCE_UNAVAILABLE");
    return fallback(before, storedItems, error, now);
  }
}
