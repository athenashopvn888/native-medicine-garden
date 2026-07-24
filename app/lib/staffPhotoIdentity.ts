export function normalizeStaffName(value: unknown) {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 60) : "";
  if (name.length < 2 || /[\u0000-\u001f<>]/.test(name)) return null;
  return name;
}

export function mutationRetryDelay(attempt: number, random = Math.random()) {
  const boundedAttempt = Math.max(0, Math.min(9, Math.trunc(attempt)));
  const base = Math.min(1_000, 35 * (2 ** boundedAttempt));
  return Math.round(base + Math.max(0, Math.min(1, random)) * Math.min(250, base));
}
