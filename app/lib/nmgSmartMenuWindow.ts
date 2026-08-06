export const NMG_REGULAR_WINDOW_MINUTES = 30;
export const NMG_REGULAR_WINDOW_MS = NMG_REGULAR_WINDOW_MINUTES * 60_000;

export interface RegularWindow<T> {
  products: T[];
  bucket: number;
  index: number;
  count: number;
  cycle: number;
}

function rotate<T>(values: T[], offset: number) {
  if (values.length < 2) return [...values];
  const normalized = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

export function regularWindowBucket(nowMs: number) {
  return Math.floor(nowMs / NMG_REGULAR_WINDOW_MS);
}

export function selectRegularWindow<T>(products: readonly T[], capacity: number, bucket: number): RegularWindow<T> {
  if (!Number.isInteger(capacity) || capacity < 0) throw new Error("Regular window capacity is invalid.");
  if (!Number.isInteger(bucket) || bucket < 0) throw new Error("Regular window bucket is invalid.");
  if (!products.length || capacity === 0) return { products: [], bucket, index: 0, count: 0, cycle: 0 };

  const count = Math.ceil(products.length / capacity);
  const index = bucket % count;
  const cycle = Math.floor(bucket / count);
  const start = index * capacity;
  const window = products.slice(start, start + capacity);

  // Membership advances by disjoint chunks, so every eligible regular SKU is
  // shown before any repeat. The row order changes deterministically on later
  // passes through the same window; no random source is used.
  return { products: rotate(window, cycle % Math.max(1, window.length)), bucket, index, count, cycle };
}
