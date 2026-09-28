/**
 * Per-store hiring lines for the in-store TV boards.
 * Set this to null to hide the hiring lines. The ribbon still shows
 * the store policy when TV_POLICY_MESSAGE is set.
 * No sheet or API lookup.
 */
export type TvHiringConfig = {
  store: string;
  headline: string;
  role: string;
  cta: string;
  url: string;
  displayUrl: string;
};

export const tvHiring: TvHiringConfig | null = {
  store: "NMG01",
  headline: "NOW HIRING",
  role: "BUDTENDERS / MANAGERS",
  cta: "APPLY ONLINE",
  url: "https://www.nativemedicinecannabis.com",
  displayUrl: "nativemedicinecannabis.com",
};
