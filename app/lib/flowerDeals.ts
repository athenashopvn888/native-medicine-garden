export const BOGO_BUY_2_GET_1 = "Buy 2g Get 1g FREE";
export const BOGO_BUY_3_GET_3 = "Buy 3g Get 3g FREE";

export interface BoardDeal {
  label: string;
  total: string;
  price: number;
  grams: number;
  equals?: string;
}

export function formatDollars(amount: number): string {
  const cents = Math.round(amount * 100);
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

export function perGramIsExact(price: number, grams: number): boolean {
  return grams > 0 && Math.round(price * 100) % grams === 0;
}

export function formatPerGram(price: number, grams: number): string {
  const cents = Math.round((price / grams) * 100);
  const value = `${formatDollars(cents / 100)}/g`;
  return perGramIsExact(price, grams) ? value : `~${value}`;
}

export function formatAsLowAsAfterPromos(price: number, grams: number): string {
  return `As low as ${formatPerGram(price, grams)} after promos`;
}

export function formatSitewideBogoStrip(): string {
  return `TOP WEED TIER SPECIAL · ${BOGO_BUY_2_GET_1}  ${BOGO_BUY_3_GET_3} *`;
}

export function isBogoDeal(deal: BoardDeal | null | undefined): deal is BoardDeal & { equals: string } {
  return Boolean(deal?.equals);
}
