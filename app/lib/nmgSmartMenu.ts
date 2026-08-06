export const NMG_SMART_TIERS = ["EXOTIC", "PREMIUM", "AAA+", "AA", "BUDGET"] as const;
export type SmartTier = (typeof NMG_SMART_TIERS)[number];
export type SmartBadge = "SALE" | "TOP PICK" | "MUST TRY" | "REGULAR";
export type QuantityMap = Record<string, number>;

export interface SmartMenuConfig {
  storeCode: "NMG01";
  periodHours: number;
  freshnessMaxHours: number;
  safetyStock: Record<SmartTier, number>;
  clearTailMax: Record<SmartTier, number>;
  pageSize: number;
  mustTryStablePeriods: number;
  mustTryCooldownPeriods: number;
  minSnapshotCoverageRatio: number;
  saleRanks: Record<string, number>;
}

export interface RawInventory {
  storeCode: string;
  date: string;
  skuCount: number;
  stock: Record<string, QuantityMap>;
}

export interface CatalogFlower {
  sku: string;
  name: string;
  slug?: string;
  tier: string;
  type: "indica" | "sativa" | "hybrid";
  isHot?: boolean;
  isSale?: boolean;
  saleRank?: number;
  thc: string;
  price3g: unknown | null;
  price5g: unknown | null;
  price14g: unknown | null;
  price28g: unknown | null;
  image: string;
  promoImage?: string | null;
}

export interface CatalogItem { sku: string; category?: string }

export interface SmartFlower extends Omit<CatalogFlower, "saleRank"> {
  tier: SmartTier;
  isHot: boolean;
  isSale: boolean;
  isMustTry: boolean;
  smartBadge: SmartBadge;
  saleRank: number | null;
  quantities: QuantityMap;
  totalUnits: number;
  stockTimestamp: string;
}

export interface SmartPage {
  id: string;
  label: string;
  kind: "sale" | "regular";
  products: SmartFlower[];
}

export interface SmartTierLineup { tier: SmartTier; pages: SmartPage[] }

export interface SmartAudit {
  accepted: boolean;
  inputCatalogFlowers: number;
  inputStockSkus: number;
  inputFlowerStockSkus: number;
  includedSkus: number;
  excludedByReason: Record<string, number>;
  saleCount: number;
  topPickCount: number;
  mustTryCount: number;
  regularCount: number;
  pageCount: number;
  missingSkus: string[];
  duplicateSkus: string[];
  wrongCategorySkus: string[];
  outOfStockIncludedSkus: string[];
  unexplainedExcludedSkus: string[];
}

export interface SmartManifest extends SmartAudit {
  storeCode: "NMG01";
  sourceTimestamp: string;
  generatedAt: string;
  period: number;
  version: string;
  stockSignature: string;
}

export interface SmartLineup {
  schemaVersion: 1;
  storeCode: "NMG01";
  sourceTimestamp: string;
  generatedAt: string;
  period: number;
  version: string;
  tiers: Record<SmartTier, SmartTierLineup>;
  manifest: SmartManifest;
}

export interface InventorySnapshot {
  period: number;
  sourceTimestamp: string;
  signature: string;
  flowerQuantities: Record<string, QuantityMap>;
  flowerSkuCount: number;
}

export interface SmartMenuState {
  schemaVersion: 1;
  updatedAt: string;
  snapshots: InventorySnapshot[];
  currentLineup: SmartLineup | null;
  lastGoodLineup: SmartLineup | null;
  previousTopByTier: Partial<Record<SmartTier, string>>;
  previousMustByTier: Partial<Record<SmartTier, string>>;
  topCooldownUntil: Record<string, number>;
  mustCooldownUntil: Record<string, number>;
  rotationOffset: number;
  manifest: SmartManifest | null;
}

export class SmartMenuInputError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "SmartMenuInputError";
    this.code = code;
  }
}

export function defaultSmartMenuState(now = new Date()): SmartMenuState {
  return {
    schemaVersion: 1,
    updatedAt: now.toISOString(),
    snapshots: [],
    currentLineup: null,
    lastGoodLineup: null,
    previousTopByTier: {},
    previousMustByTier: {},
    topCooldownUntil: {},
    mustCooldownUntil: {},
    rotationOffset: 0,
    manifest: null,
  };
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function stableStringifyQuantities(stock: Record<string, QuantityMap>) {
  return Object.keys(stock).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map((sku) => {
    const weights = stock[sku];
    return `${sku}:${Object.keys(weights).sort().map((key) => `${key}=${weights[key]}`).join(",")}`;
  }).join("|");
}

function stockSignature(stock: Record<string, QuantityMap>) {
  return stableHash(stableStringifyQuantities(stock)).toString(16).padStart(8, "0");
}

function skuSort(a: { sku: string }, b: { sku: string }) {
  return a.sku.localeCompare(b.sku, undefined, { numeric: true });
}

function totalUnits(quantities: QuantityMap) {
  return Object.values(quantities).reduce((sum, value) => sum + value, 0);
}

function hasSalePrice(product: CatalogFlower) {
  return [product.price3g, product.price5g, product.price14g, product.price28g].some((point) => {
    if (!point || typeof point !== "object") return false;
    return (point as { sale?: unknown }).sale !== null && Number.isFinite(Number((point as { sale?: unknown }).sale));
  });
}

function validateInventory(input: RawInventory, now: Date, config: SmartMenuConfig) {
  if (input.storeCode !== config.storeCode) throw new SmartMenuInputError("STORE_MISMATCH", "Inventory store code does not match NMG01.");
  const sourceMs = Date.parse(input.date);
  if (!Number.isFinite(sourceMs)) throw new SmartMenuInputError("INVALID_TIMESTAMP", "Inventory timestamp is invalid.");
  const ageHours = (now.getTime() - sourceMs) / 3_600_000;
  if (ageHours < -1 || ageHours > config.freshnessMaxHours) throw new SmartMenuInputError("STALE_INVENTORY", "Inventory email is stale.");
  if (!input.stock || typeof input.stock !== "object" || Array.isArray(input.stock)) throw new SmartMenuInputError("MALFORMED_STOCK", "Inventory quantities are missing.");
  const skus = Object.keys(input.stock);
  if (!Number.isInteger(input.skuCount) || input.skuCount !== skus.length || skus.length === 0) {
    throw new SmartMenuInputError("PARTIAL_STOCK", "Inventory SKU count is incomplete.");
  }
  for (const [sku, weights] of Object.entries(input.stock)) {
    if (!/^\d+$/.test(sku) || !weights || typeof weights !== "object" || Array.isArray(weights) || Object.keys(weights).length === 0) {
      throw new SmartMenuInputError("MALFORMED_QUANTITY", `Inventory quantity map is invalid for SKU ${sku}.`);
    }
    for (const [weight, quantity] of Object.entries(weights)) {
      if (!/^[a-z0-9]+$/i.test(weight) || !Number.isInteger(quantity) || quantity < 0) {
        throw new SmartMenuInputError("MALFORMED_QUANTITY", `Inventory quantity is invalid for SKU ${sku}.`);
      }
    }
  }
}

function expandItemSkus(items: CatalogItem[]) {
  const skus = new Set<string>();
  for (const item of items) for (const sku of String(item.sku || "").split(",")) if (sku.trim()) skus.add(sku.trim());
  return skus;
}

function pageLabel(index: number) {
  return index < 26 ? `Set ${String.fromCharCode(65 + index)}` : `Set ${index + 1}`;
}

function chunkPages(tier: SmartTier, kind: "sale" | "regular", products: SmartFlower[], pageSize: number) {
  const pages: SmartPage[] = [];
  for (let start = 0; start < products.length; start += pageSize) {
    const pageIndex = start / pageSize;
    pages.push({
      id: `${tier.toLowerCase().replace("+", "plus")}-${kind}-${pageIndex + 1}`,
      label: kind === "sale" ? `Sale ${pageIndex + 1}` : pageLabel(pageIndex),
      kind,
      products: products.slice(start, start + pageSize),
    });
  }
  return pages;
}

function quantitiesEqual(a: QuantityMap | undefined, b: QuantityMap | undefined) {
  if (!a || !b) return false;
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  return aKeys.length === bKeys.length && aKeys.every((key, index) => key === bKeys[index] && a[key] === b[key]);
}

function hasStableHistory(sku: string, snapshots: InventorySnapshot[], period: number, required: number) {
  const recent = snapshots.filter((snapshot) => snapshot.period <= period).sort((a, b) => b.period - a.period).slice(0, required);
  if (recent.length !== required) return false;
  for (let index = 0; index < recent.length; index += 1) {
    if (recent[index].period !== period - index) return false;
    if (!quantitiesEqual(recent[0].flowerQuantities[sku], recent[index].flowerQuantities[sku])) return false;
  }
  return true;
}

function rotate<T>(values: T[], offset: number) {
  if (!values.length) return values;
  const normalized = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

export function buildSmartLineup(args: {
  inventory: RawInventory;
  flowers: CatalogFlower[];
  items: CatalogItem[];
  state: SmartMenuState;
  config: SmartMenuConfig;
  now?: Date;
}): { lineup: SmartLineup; nextState: SmartMenuState } {
  const now = args.now || new Date();
  const { inventory, flowers, items, config } = args;
  validateInventory(inventory, now, config);
  const period = Math.floor(now.getTime() / (config.periodHours * 3_600_000));
  const signature = stockSignature(inventory.stock);
  const version = `nmg-${period}-${signature}`;
  const itemSkus = expandItemSkus(items);
  const catalogGroups = new Map<string, CatalogFlower[]>();
  for (const flower of flowers) {
    const sku = String(flower.sku || "").trim();
    if (!sku) continue;
    const group = catalogGroups.get(sku) || [];
    group.push(flower);
    catalogGroups.set(sku, group);
  }
  const excluded = new Map<string, string>();
  const flowerQuantities: Record<string, QuantityMap> = {};
  const candidates: SmartFlower[] = [];
  const duplicateInputSkus: string[] = [];

  for (const [sku, group] of catalogGroups) {
    if (group.length !== 1) {
      duplicateInputSkus.push(sku);
      excluded.set(sku, "duplicate-catalog-sku");
      continue;
    }
    const quantities = inventory.stock[sku];
    if (!quantities || totalUnits(quantities) <= 0) {
      excluded.set(sku, "out-of-stock");
      continue;
    }
    if (itemSkus.has(sku)) throw new SmartMenuInputError("CATEGORY_OVERLAP", `SKU ${sku} is both a flower and an item.`);
    const source = group[0];
    const tier = String(source.tier || "").toUpperCase() as SmartTier;
    if (!NMG_SMART_TIERS.includes(tier)) {
      excluded.set(sku, "invalid-flower-tier");
      continue;
    }
    const allowedWeights = new Set(["3g", "5g", "14g", "28g"]);
    if (Object.keys(quantities).some((weight) => !allowedWeights.has(weight))) {
      throw new SmartMenuInputError("WRONG_CATEGORY", `Flower SKU ${sku} has a non-flower quantity key.`);
    }
    flowerQuantities[sku] = { ...quantities };
    const sale = Boolean(source.isSale || hasSalePrice(source));
    const rank = source.saleRank ?? config.saleRanks[sku];
    if (sale && (!Number.isInteger(rank) || Number(rank) < 1)) {
      throw new SmartMenuInputError("MISSING_SALE_RANK", `Sale SKU ${sku} is missing an explicit saleRank.`);
    }
    const product: SmartFlower = {
      ...source,
      tier,
      isSale: sale,
      isHot: false,
      isMustTry: false,
      smartBadge: sale ? "SALE" : "REGULAR",
      saleRank: sale ? Number(rank) : null,
      quantities: { ...quantities },
      totalUnits: totalUnits(quantities),
      stockTimestamp: inventory.date,
      price3g: quantities["3g"] > 0 ? source.price3g : null,
      price5g: quantities["5g"] > 0 ? source.price5g : null,
      price14g: quantities["14g"] > 0 ? source.price14g : null,
      price28g: quantities["28g"] > 0 ? source.price28g : null,
    };
    if (!product.price3g && !product.price5g && !product.price14g && !product.price28g) {
      throw new SmartMenuInputError("OUT_OF_STOCK_LINEUP", `Flower SKU ${sku} has quantities but no matching visible weight.`);
    }
    candidates.push(product);
  }

  for (const sku of Object.keys(inventory.stock)) {
    if (catalogGroups.has(sku)) continue;
    excluded.set(sku, itemSkus.has(sku) ? "non-flower-item" : "not-in-catalog");
  }

  const previousSnapshot = args.state.snapshots.at(-1);
  if (previousSnapshot && candidates.length < Math.ceil(previousSnapshot.flowerSkuCount * config.minSnapshotCoverageRatio)) {
    throw new SmartMenuInputError("PARTIAL_FLOWER_INVENTORY", "Flower inventory coverage dropped below the safe threshold.");
  }
  const snapshot: InventorySnapshot = { period, sourceTimestamp: inventory.date, signature, flowerQuantities, flowerSkuCount: candidates.length };
  const snapshots = args.state.snapshots.filter((row) => row.period !== period).concat(snapshot).sort((a, b) => a.period - b.period).slice(-12);
  const isNewPeriod = !args.state.currentLineup || args.state.currentLineup.period !== period;
  const nextTopCooldown = { ...args.state.topCooldownUntil };
  const nextMustCooldown = { ...args.state.mustCooldownUntil };
  const nextPreviousTop: Partial<Record<SmartTier, string>> = {};
  const nextPreviousMust: Partial<Record<SmartTier, string>> = {};
  const tiers = {} as Record<SmartTier, SmartTierLineup>;

  for (const tier of NMG_SMART_TIERS) {
    const tierProducts = candidates.filter((product) => product.tier === tier);
    const sales = tierProducts.filter((product) => product.isSale).sort((a, b) => (a.saleRank || 0) - (b.saleRank || 0) || skuSort(a, b));
    const nonSales = tierProducts.filter((product) => !product.isSale);
    const priorTop = args.state.previousTopByTier[tier];
    const topEligible = nonSales.filter((product) =>
      product.totalUnits > config.safetyStock[tier] &&
      product.totalUnits <= config.clearTailMax[tier] &&
      (!isNewPeriod || product.sku !== priorTop) &&
      (!isNewPeriod || (nextTopCooldown[product.sku] || -1) < period),
    ).sort((a, b) => a.totalUnits - b.totalUnits || skuSort(a, b));
    const top = topEligible[0];
    if (top) {
      top.isHot = true;
      top.smartBadge = "TOP PICK";
      nextPreviousTop[tier] = top.sku;
      if (isNewPeriod) nextTopCooldown[top.sku] = period + 1;
    }
    const priorMust = args.state.previousMustByTier[tier];
    const mustEligible = nonSales.filter((product) =>
      product.sku !== top?.sku &&
      hasStableHistory(product.sku, snapshots, period, config.mustTryStablePeriods) &&
      (!isNewPeriod || product.sku !== priorMust) &&
      (!isNewPeriod || (nextMustCooldown[product.sku] || -1) < period),
    ).sort((a, b) => stableHash(`${version}:${tier}:${a.sku}`) - stableHash(`${version}:${tier}:${b.sku}`) || skuSort(a, b));
    const must = mustEligible[0];
    if (must) {
      must.isMustTry = true;
      must.smartBadge = "MUST TRY";
      nextPreviousMust[tier] = must.sku;
      if (isNewPeriod) nextMustCooldown[must.sku] = period + config.mustTryCooldownPeriods;
    }
    const regular = nonSales.filter((product) => product.sku !== top?.sku && product.sku !== must?.sku).sort(skuSort);
    const rotationOffset = regular.length ? stableHash(`${period}:${tier}`) % regular.length : 0;
    const regularOrdered = [top, must, ...rotate(regular, rotationOffset)].filter((value): value is SmartFlower => Boolean(value));
    tiers[tier] = {
      tier,
      pages: [
        ...chunkPages(tier, "sale", sales, config.pageSize),
        ...chunkPages(tier, "regular", regularOrdered, config.pageSize),
      ],
    };
  }

  const allPageProducts = NMG_SMART_TIERS.flatMap((tier) => tiers[tier].pages.flatMap((page) => page.products));
  const eligibleSkus = candidates.map((product) => product.sku).sort();
  const counts = new Map<string, number>();
  for (const product of allPageProducts) counts.set(product.sku, (counts.get(product.sku) || 0) + 1);
  const missingSkus = eligibleSkus.filter((sku) => !counts.has(sku));
  const duplicateSkus = [...counts.entries()].filter(([, count]) => count !== 1).map(([sku]) => sku).concat(duplicateInputSkus).sort();
  const wrongCategorySkus = NMG_SMART_TIERS.flatMap((tier) => tiers[tier].pages.flatMap((page) => page.products.filter((product) => product.tier !== tier).map((product) => product.sku)));
  const outOfStockIncludedSkus = allPageProducts.filter((product) => product.totalUnits <= 0).map((product) => product.sku);
  const explained = new Set([...excluded.keys(), ...eligibleSkus]);
  const unexplainedExcludedSkus = Object.keys(inventory.stock).filter((sku) => !explained.has(sku));
  const excludedByReason: Record<string, number> = {};
  for (const reason of excluded.values()) excludedByReason[reason] = (excludedByReason[reason] || 0) + 1;
  const accepted = !missingSkus.length && !duplicateSkus.length && !wrongCategorySkus.length && !outOfStockIncludedSkus.length && !unexplainedExcludedSkus.length;
  if (!accepted) throw new SmartMenuInputError("COVERAGE_AUDIT_FAILED", "Smart menu coverage audit rejected the lineup.");
  const audit: SmartAudit = {
    accepted,
    inputCatalogFlowers: flowers.length,
    inputStockSkus: Object.keys(inventory.stock).length,
    inputFlowerStockSkus: candidates.length,
    includedSkus: allPageProducts.length,
    excludedByReason,
    saleCount: allPageProducts.filter((product) => product.smartBadge === "SALE").length,
    topPickCount: allPageProducts.filter((product) => product.smartBadge === "TOP PICK").length,
    mustTryCount: allPageProducts.filter((product) => product.smartBadge === "MUST TRY").length,
    regularCount: allPageProducts.filter((product) => product.smartBadge === "REGULAR").length,
    pageCount: NMG_SMART_TIERS.reduce((sum, tier) => sum + tiers[tier].pages.length, 0),
    missingSkus,
    duplicateSkus,
    wrongCategorySkus,
    outOfStockIncludedSkus,
    unexplainedExcludedSkus,
  };
  const generatedAt = now.toISOString();
  const manifest: SmartManifest = { ...audit, storeCode: "NMG01", sourceTimestamp: inventory.date, generatedAt, period, version, stockSignature: signature };
  const lineup: SmartLineup = { schemaVersion: 1, storeCode: "NMG01", sourceTimestamp: inventory.date, generatedAt, period, version, tiers, manifest };
  const nextState: SmartMenuState = {
    schemaVersion: 1,
    updatedAt: generatedAt,
    snapshots,
    currentLineup: lineup,
    lastGoodLineup: lineup,
    previousTopByTier: nextPreviousTop,
    previousMustByTier: nextPreviousMust,
    topCooldownUntil: nextTopCooldown,
    mustCooldownUntil: nextMustCooldown,
    rotationOffset: period,
    manifest,
  };
  return { lineup, nextState };
}

export function buildOrRetainSmartLineup(args: Parameters<typeof buildSmartLineup>[0]): {
  lineup: SmartLineup;
  nextState: SmartMenuState;
  servedFrom: "fresh" | "last-good";
  fallbackReason: string | null;
} {
  try {
    const built = buildSmartLineup(args);
    return { ...built, servedFrom: "fresh", fallbackReason: null };
  } catch (error) {
    if (!args.state.lastGoodLineup) throw error;
    return {
      lineup: args.state.lastGoodLineup,
      nextState: structuredClone(args.state),
      servedFrom: "last-good",
      fallbackReason: error instanceof SmartMenuInputError ? error.code : "SOURCE_UNAVAILABLE",
    };
  }
}
