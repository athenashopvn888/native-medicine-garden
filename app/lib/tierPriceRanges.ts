type PriceValue = number | string | { regular?: unknown; sale?: unknown } | null | undefined;

export type TierRange = {
  count: number;
  perGram?: [number, number];
  thc?: [number, number];
};

type StoreFlower = {
  tier?: unknown;
  thc?: unknown;
  price3g?: PriceValue;
  price5g?: PriceValue;
  price14g?: PriceValue;
  price28g?: PriceValue;
};

type DeliveryProduct = {
  tier?: unknown;
  thc?: unknown;
  priceOptions?: Array<{ label?: unknown; price?: unknown }>;
};

const STORE_WEIGHTS = [
  ["price3g", 3],
  ["price5g", 5],
  ["price14g", 14],
  ["price28g", 28],
] as const;

function positiveNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function paidPrice(value: PriceValue): number | null {
  if (value && typeof value === "object") {
    return positiveNumber(value.sale) ?? positiveNumber(value.regular);
  }
  return positiveNumber(value);
}

function range(values: number[]): [number, number] | undefined {
  return values.length ? [Math.min(...values), Math.max(...values)] : undefined;
}

function thcNumbers(value: unknown): number[] {
  return (String(value ?? "").match(/\d+(?:\.\d+)?/g) || [])
    .map(Number)
    .filter((number) => number > 0 && number <= 100);
}

export function storeTierRange(flowers: StoreFlower[], tier: string): TierRange {
  const matches = flowers.filter((flower) => String(flower.tier || "").toUpperCase() === tier.toUpperCase());
  const perGram: number[] = [];
  const thc: number[] = [];
  for (const flower of matches) {
    for (const [key, grams] of STORE_WEIGHTS) {
      const price = paidPrice(flower[key]);
      if (price !== null) perGram.push(price / grams);
    }
    thc.push(...thcNumbers(flower.thc));
  }
  return { count: matches.length, perGram: range(perGram), thc: range(thc) };
}

export function deliveryTierRanges(products: DeliveryProduct[]): Array<{ tier: string; range: TierRange }> {
  const tiers = [...new Set(products.map((product) => String(product.tier || "").trim()).filter(Boolean))];
  return tiers.map((tier) => {
    const matches = products.filter((product) => String(product.tier || "").trim() === tier);
    const perGram: number[] = [];
    const thc: number[] = [];
    for (const product of matches) {
      for (const option of product.priceOptions || []) {
        const grams = positiveNumber(String(option.label || "").replace(/[^0-9.]/g, ""));
        const price = positiveNumber(option.price);
        if (grams !== null && price !== null) perGram.push(price / grams);
      }
      thc.push(...thcNumbers(product.thc));
    }
    return { tier, range: { count: matches.length, perGram: range(perGram), thc: range(thc) } };
  });
}

function money(value: number): string {
  return `$${(Math.round(value * 100) / 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")}`;
}

function percent(value: number): string {
  return String(Math.round(value * 10) / 10).replace(/\.0$/, "");
}

export function tierRangeText(value: TierRange): string | null {
  const parts: string[] = [];
  if (value.perGram) {
    const [low, high] = value.perGram;
    parts.push(money(low) === money(high) ? `${money(low)} a gram` : `From ${money(low)} to ${money(high)} a gram`);
  }
  if (value.thc) {
    const [low, high] = value.thc;
    parts.push(percent(low) === percent(high) ? `THC about ${percent(low)}%` : `THC about ${percent(low)} to ${percent(high)}%`);
  }
  return parts.length ? parts.join(" · ") : null;
}

