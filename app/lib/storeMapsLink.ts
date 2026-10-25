import { FULL_NAME_NAP } from "./fullNameNap.ts";
import { DIRECTIONS_URL, GBP_MAPS_CID } from "./store.ts";

/**
 * Maps links already configured for this store.
 * No maps.app.goo.gl short link is published here.
 */
export const STORE_MAP_LINKS = [GBP_MAPS_CID, FULL_NAME_NAP.mapsUrl, DIRECTIONS_URL] as const;

const isShortPin = (url: string) => url.includes("maps.app.goo.gl");

/** GBP pin: short link, Maps cid, or a place_id listing. */
export const isGbpPin = (url: string) => isShortPin(url) || /(?:[?&]cid=|place_id:)/.test(url);

/**
 * Directions target. Prefer a maps.app.goo.gl link or other GBP pin.
 * Otherwise use the Google Maps directions URL for the store address.
 */
export function preferredStoreMapsUrl(links: readonly string[] = STORE_MAP_LINKS): string {
  const short = links.find(isShortPin);
  if (short) return short;
  const pin = links.find((url) => isGbpPin(url));
  if (pin) return pin;
  const directions = links.find((url) => url.includes("/maps/dir") || url.includes("destination="));
  if (directions) return directions;
  return DIRECTIONS_URL;
}
