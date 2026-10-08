/**
 * NMG01 TV menu loading.
 *
 * /api/tv-data reads the Apps Script deployment the same way the reference
 * boards do: `?store=NMG01` merges the stock email with the master catalog.
 * A successful live payload is cached in memory for TV_STOCK_CACHE_MS (~5 min).
 * Failures, empty feeds, and partial feeds are not cached. They fall back to
 * the repo snapshot (app/lib/flowers.json and app/lib/items.json).
 * Callers still send Cache-Control: no-store.
 *
 * scripts/prebuild-stock.js reads APPS_SCRIPT_URL and does not embed a URL.
 * When that env var is empty, the TV route uses the fleet Apps Script
 * deployment already verified for store code NMG01.
 */

import type { FlowerProduct, ItemProduct } from "./products";

export const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx09_sDal1eMVF1r-hUck4e7oq_XBHEWhGvA79JuhZNQ6P4CdhCas0xE3FfexWQ3hq4/exec";

export const TV_STORE = "NMG01";
export const TV_STOCK_CACHE_MS = 300 * 1000;
export const TV_STOCK_FAILURE_CACHE_MS = 60 * 1000;
export const TV_STOCK_FETCH_TIMEOUT_MS = 25000;
export const PARTIAL_STOCK_RATIO = 0.5;

const SALE_RE = /\bSALE\b/i;
const ON_SALE_RE = /ON\s*SALE/i;

export type TvFlower = FlowerProduct & { isMustTry?: boolean; promoImage?: string | null };
export type TvItem = ItemProduct & { isSale?: boolean };

type TvDataset = {
  source: "live" | "last-good" | "static-fallback";
  flowers: TvFlower[];
  items: TvItem[];
  stockDate: string;
  fallbackReason?: string;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export type TvStockOptions = {
  type?: string | null;
  staticFlowers?: TvFlower[];
  staticItems?: TvItem[];
  appsScriptUrl?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  now?: number;
};

function hasSalePrice(flower: TvFlower) {
  return !!(
    (flower.price3g && flower.price3g.sale !== null) ||
    (flower.price5g && flower.price5g.sale !== null) ||
    (flower.price14g && flower.price14g.sale !== null) ||
    (flower.price28g && flower.price28g.sale !== null)
  );
}

function cleanName(name: string) {
  return name
    .replace(/\s*\(?\s*AAA\+?\s*ON\s*SALE\s*\)?\s*$/i, "")
    .replace(/\s*\(?\s*AAA\+?\s*SALE!?\s*\)?\s*$/i, "")
    .replace(/\s*\bSALE!?\s*$/i, "")
    .replace(/\s*\bON\s*SALE\s*$/i, "")
    .trim();
}

function postprocessFlowers(flowers: TvFlower[]) {
  for (const flower of flowers) {
    if (!flower.isSale) {
      if (SALE_RE.test(flower.name) || ON_SALE_RE.test(flower.name) || hasSalePrice(flower)) {
        flower.isSale = true;
      }
    }
    flower.name = cleanName(flower.name);
  }
  return flowers;
}

function postprocessItems(items: TvItem[]) {
  for (const item of items) {
    if (typeof item.price === "string" && item.price.includes("[object")) {
      item.price = "";
    }
  }
  return items;
}

export function resolveAppsScriptUrl(explicit?: string) {
  const raw = explicit != null ? String(explicit) : String(process.env.APPS_SCRIPT_URL || "");
  const trimmed = raw.trim();
  return trimmed || DEFAULT_APPS_SCRIPT_URL;
}

function stockEndpoint(baseUrl: string) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}store=${TV_STORE}`;
}

function staticDataset(staticFlowers?: TvFlower[], staticItems?: TvItem[]): TvDataset {
  return {
    source: "static-fallback",
    flowers: Array.isArray(staticFlowers) ? staticFlowers : [],
    items: Array.isArray(staticItems) ? staticItems : [],
    stockDate: "",
  };
}

function rejectLiveStock(
  data: { flowers?: unknown; items?: unknown },
  staticFlowers?: TvFlower[],
  staticItems?: TvItem[],
) {
  if (!data || typeof data !== "object") return "invalid payload";
  if (!Array.isArray(data.flowers) || !Array.isArray(data.items)) return "missing flowers or items";
  if (data.flowers.length === 0 || data.items.length === 0) return "empty flowers or items";

  const flowerBaseline = Array.isArray(staticFlowers) ? staticFlowers.length : 0;
  const itemBaseline = Array.isArray(staticItems) ? staticItems.length : 0;
  if (flowerBaseline > 0 && data.flowers.length < flowerBaseline * PARTIAL_STOCK_RATIO) {
    return `partial flowers ${data.flowers.length}/${flowerBaseline}`;
  }
  if (itemBaseline > 0 && data.items.length < itemBaseline * PARTIAL_STOCK_RATIO) {
    return `partial items ${data.items.length}/${itemBaseline}`;
  }
  return null;
}

let cached: { expiresAt: number; dataset: TvDataset } | null = null;
let lastGood: TvDataset | null = null;
let failureUntil = 0;
let failureReason = "";
let inflight: Promise<TvDataset> | null = null;

export function resetTvStockCache() {
  cached = null;
  lastGood = null;
  failureUntil = 0;
  failureReason = "";
  inflight = null;
}

function selectTvPayload(dataset: TvDataset, type?: string | null) {
  const body = type === "items" ? dataset.items : dataset.flowers;
  return {
    body,
    headers: {
      "x-tv-data-source": dataset.source,
      "x-tv-data-as-of": dataset.stockDate,
      "x-tv-data-store": TV_STORE,
      "x-tv-data-flower-count": String(dataset.flowers.length),
      "x-tv-data-item-count": String(dataset.items.length),
      ...(dataset.fallbackReason ? { "x-tv-data-fallback-reason": dataset.fallbackReason } : {}),
      "Cache-Control": "no-store",
    },
  };
}

async function resolveDataset(options: TvStockOptions): Promise<TvDataset> {
  const fetchImpl = options.fetchImpl || fetch;
  const timeoutMs = options.timeoutMs ?? TV_STOCK_FETCH_TIMEOUT_MS;
  const endpoint = stockEndpoint(resolveAppsScriptUrl(options.appsScriptUrl));

  try {
    const res = await fetchImpl(endpoint, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    } as RequestInit);

    if (!res || !res.ok) {
      const status = res ? res.status : "no response";
      return fallbackDataset(options, `HTTP ${status}`);
    }

    let data: { flowers?: TvFlower[]; items?: TvItem[]; stockDate?: unknown };
    try {
      data = await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return fallbackDataset(options, `invalid JSON: ${message}`);
    }

    const reason = rejectLiveStock(data, options.staticFlowers, options.staticItems);
    if (reason) {
      return fallbackDataset(options, reason);
    }

    const flowers = postprocessFlowers(data.flowers || []);
    const items = postprocessItems(data.items || []);
    const dataset: TvDataset = {
      source: "live",
      flowers,
      items,
      stockDate: data.stockDate == null ? "" : String(data.stockDate),
    };
    const now = options.now ?? Date.now();
    cached = { expiresAt: now + TV_STOCK_CACHE_MS, dataset };
    lastGood = dataset;
    failureUntil = 0;
    failureReason = "";
    return dataset;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return fallbackDataset(options, `fetch failed: ${message}`);
  }
}

function fallbackDataset(options: TvStockOptions, reason: string): TvDataset {
  const now = options.now ?? Date.now();
  failureReason = reason;
  failureUntil = now + TV_STOCK_FAILURE_CACHE_MS;
  const dataset: TvDataset = lastGood
    ? { ...lastGood, source: "last-good", fallbackReason: reason }
    : { ...staticDataset(options.staticFlowers, options.staticItems), fallbackReason: reason };
  console.warn(`[tv-data] Live stock failed (${reason}); serving ${dataset.source}`);
  return dataset;
}

export async function getTvData(options: TvStockOptions) {
  const now = options.now ?? Date.now();
  let dataset: TvDataset;
  if (cached && now < cached.expiresAt) {
    dataset = cached.dataset;
  } else if (now < failureUntil) {
    dataset = lastGood
      ? { ...lastGood, source: "last-good", fallbackReason: failureReason }
      : { ...staticDataset(options.staticFlowers, options.staticItems), fallbackReason: failureReason };
  } else {
    if (!inflight) {
      inflight = resolveDataset(options).finally(() => {
        inflight = null;
      });
    }
    dataset = await inflight;
  }

  const requested = options.type === "items" ? dataset.items : dataset.flowers;
  const staticRequested = options.type === "items" ? options.staticItems : options.staticFlowers;
  if (
    Array.isArray(requested) &&
    requested.length === 0 &&
    Array.isArray(staticRequested) &&
    staticRequested.length > 0
  ) {
    dataset = staticDataset(options.staticFlowers, options.staticItems);
  }

  return selectTvPayload(dataset, options.type);
}
