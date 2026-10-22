import {
  CITY,
  DIRECTIONS_URL,
  GEO,
  HOURS_LABEL,
  MAP_EMBED_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  POSTAL_CODE,
  PRIMARY_ORIGIN,
  REGION,
  STORE_NAME,
  STREET_ADDRESS,
} from "../store.ts";
import { FLEET_STORE_CODE, type Nap, type ResolvedBanner, type ResolvedPage } from "./types.ts";

const STORE_AREA = "Gerrard & Bay";

export const CODED_NAP: Nap = {
  name: STORE_NAME,
  street: STREET_ADDRESS,
  city: CITY,
  province: REGION,
  postalCode: POSTAL_CODE,
  cityLine: `${CITY}, ${REGION} ${POSTAL_CODE}`,
  area: STORE_AREA,
  intersection: "Gerrard St W & Bay St",
  areaLine: `Gerrard St W & Bay St, ${STORE_AREA}`,
  phoneDisplay: PHONE_DISPLAY,
  phoneTel: PHONE_TEL,
  hours: HOURS_LABEL,
  mapsSearchUrl: DIRECTIONS_URL,
  mapsEmbedUrl: MAP_EMBED_URL,
  lat: String(GEO.latitude),
  lng: String(GEO.longitude),
  schemaName: "Native Medicine Garden Dispensary Weed Delivery",
  website: PRIMARY_ORIGIN,
};

/** Sheet spot names that drive each home banner. The first name is the one the publisher uses. */
export const HOME_SPOT_ALIASES: Record<ResolvedBanner["id"], readonly string[]> = {
  weed: ["Top banner"],
  promo1: ["Promo banner 1"],
  vapes: ["Promo banner 2"],
  welcome: ["Promo banner 3", "welcome", "Welcome banner"],
};

export const CODED_BANNERS: ResolvedBanner[] = [
  {
    id: "weed",
    page: "Home",
    spot: "Top banner",
    href: "/exotic-weed",
    categoryName: "Exotic Weed",
    hidden: false,
    render: "image",
    image: "/banners/top-weed-tier-nmg01.webp",
    codedImage: "/banners/top-weed-tier-nmg01.webp",
    alt: `${STORE_NAME} in ${STORE_AREA} — Exotic, Premium and AAA+ top weed tiers`,
    title: `${STORE_NAME} top weed tiers — Exotic, Premium and AAA+`,
    textBar: "Top 3 tiers only (Exotic, Premium, AAA+): Buy 2g Get 1g FREE · Buy 3g Get 3g FREE (6g)",
    caption: "Top 3 tiers only (Exotic, Premium, AAA+): Buy 2g Get 1g FREE · Buy 3g Get 3g FREE (6g)",
  },
  {
    id: "promo1",
    page: "Home",
    spot: "Promo banner 1",
    href: "/",
    categoryName: "Promo",
    hidden: true,
    render: "image",
    image: "",
    codedImage: "",
    alt: "",
    title: "",
    textBar: "",
    caption: "",
  },
  {
    id: "vapes",
    page: "Home",
    spot: "Promo banner 2",
    href: "/items/vapes",
    categoryName: "Nicotine Vapes",
    hidden: false,
    render: "image",
    image: "/banners/core-vapes-nicotine-thc.webp",
    codedImage: "/banners/core-vapes-nicotine-thc.webp",
    alt: `${STORE_NAME} in ${STORE_AREA} — nicotine vapes and THC vapes`,
    title: `${STORE_NAME} nicotine vapes and THC vapes`,
    textBar: "Nicotine + THC vapes",
    caption: "Nicotine + THC vapes",
  },
  {
    id: "welcome",
    page: "Home",
    spot: "Promo banner 3",
    href: "/",
    categoryName: "Welcome",
    hidden: false,
    render: "image",
    image: "/banners/welcome_banner.webp",
    codedImage: "/banners/welcome_banner.webp",
    alt: "Native Medicine Garden Dispensary Weed Delivery",
    title: "Native Medicine Garden Dispensary Weed Delivery",
    textBar: "",
    caption: "",
  },
];

const HOME_DESCRIPTION = "Walk-in cannabis dispensary at 76 Gerrard St W, Gerrard & Bay, downtown Toronto near College–Bay. Flower, pre-rolls, vapes, edibles, concentrates, and accessories. Open 24 Hours. Adults 19+.";
const CONTACT_DESCRIPTION = "Visit Native Medicine Garden at 76 Gerrard St W, Toronto, ON M5G 1J5. Open 24 hours, 7 days a week. Walk-ins welcome.";

export const CODED_PAGES: Record<string, ResolvedPage> = {
  Home: {
    description: HOME_DESCRIPTION,
    metaTitle: "Native Medicine Garden | Gerrard & Bay Dispensary",
    metaDescription: HOME_DESCRIPTION,
  },
  Contact: {
    description: CONTACT_DESCRIPTION,
    metaTitle: "Contact Us — Native Medicine Garden | 76 Gerrard St W, Toronto",
    metaDescription: CONTACT_DESCRIPTION,
  },
};

export function fleetVersion(contentVersion: number | null): string {
  return contentVersion == null ? `${FLEET_STORE_CODE}:coded` : `${FLEET_STORE_CODE}:${contentVersion}`;
}
