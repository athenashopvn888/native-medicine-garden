/**
 * After a sheet banner image errors, the only allowed replacement is that
 * slot's coded image. Anything else (no coded image, or the coded image is
 * the one that just failed) becomes the category-name banner. Never a third graphic.
 */
export function nextFleetImageSrc(failedSrc: string, codedImage: string | undefined): string | null {
  const coded = codedImage?.trim() ?? "";
  if (!coded || coded === failedSrc) return null;
  return coded;
}

/** Store green, white type. No background image. */
export const FLEET_CATEGORY_BANNER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 180,
  boxSizing: "border-box" as const,
  padding: "24px",
  background: "var(--green-deep, #0a2e1d)",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: "clamp(28px, 4vw, 48px)",
  lineHeight: 1.15,
  textAlign: "center" as const,
};
