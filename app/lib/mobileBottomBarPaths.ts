/** In-store TV menus. The sticky bar is omitted on these routes. */
export const MOBILE_BOTTOM_BAR_HIDDEN_PATHS = ["/tv", "/tv2"] as const;

/** Hours page that already publishes this store's opening hours. */
export const MOBILE_BAR_HOURS_HREF = "/hours";

/** Catalog route. There is no `/menu` page in this repo. */
export const MOBILE_BAR_MENU_HREF = "/exotic-weed";

/**
 * Canonical delivery page. `/delivery` is a permanent redirect to this path,
 * so the bar links here instead of the redirect.
 */
export const MOBILE_BAR_DELIVERY_HREF = "/weed-delivery-toronto";

export function hidesMobileBottomBar(pathname: string | null | undefined) {
  const path = (pathname ?? "").split("?")[0].replace(/\/+$/, "") || "/";
  return (MOBILE_BOTTOM_BAR_HIDDEN_PATHS as readonly string[]).includes(path);
}
