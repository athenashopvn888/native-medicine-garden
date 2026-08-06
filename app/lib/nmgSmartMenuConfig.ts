import type { SmartMenuConfig, SmartTier } from "./nmgSmartMenu.ts";

const tiers: SmartTier[] = ["EXOTIC", "PREMIUM", "AAA+", "AA", "BUDGET"];
const threshold = (value: number) => Object.fromEntries(tiers.map((tier) => [tier, value])) as Record<SmartTier, number>;

export const NMG_SMART_MENU_CONFIG: SmartMenuConfig = {
  storeCode: "NMG01",
  periodHours: 4,
  freshnessMaxHours: 30,
  safetyStock: threshold(2),
  clearTailMax: threshold(12),
  pageSize: 10,
  mustTryStablePeriods: 3,
  mustTryCooldownPeriods: 2,
  minSnapshotCoverageRatio: 0.55,
  // Explicit operational order. New sale SKUs must be ranked here or supplied
  // with a catalog saleRank before a lineup can pass prepublish validation.
  saleRanks: {
    "289": 1,
    "319": 2,
    "345": 3,
    "357": 4,
    "376": 5,
    "422": 6,
    "480": 7,
    "481": 8,
    "482": 9,
    "540": 10,
    "546": 11,
    "550": 12,
    "595": 13,
    "596": 14,
  },
};
