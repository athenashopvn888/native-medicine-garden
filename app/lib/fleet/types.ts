/**
 * Site-side content bundle. The publisher is not live yet; tests use
 * fixtures/fleet. With no manifest configured, pages keep their coded content.
 *
 * Manifest: { storeCode, contentVersion, bundleUrl, publishedAt, jobId }
 * Bundle: {
 *   schemaVersion, storeCode, domain, contentVersion, publishedAt,
 *   sourceHash, jobId, storeInfo?, all?: { slots }, slots?
 * }
 * Each slot: { page, spot, mode, image?, imageWidth?, imageHeight?,
 *   textBar?, alt?, title?, caption?, description?, metaTitle?,
 *   metaDescription?, categoryName? }
 * Mode is Follow ALL | Custom | Coded | Hidden.
 * storeInfo fields are { mode?, value? }.
 */
export const FLEET_SCHEMA_VERSION = 1;
export const FLEET_STORE_CODE = "NMG01";
export const FLEET_DOMAIN = "www.nativemedicinecannabis.com";
export const FLEET_CONTENT_TAG = "fleet-content";
export const FLEET_MAX_BUNDLE_BYTES = 750_000;

export const FLEET_MODES = ["Follow ALL", "Custom", "Coded", "Hidden"] as const;
export type FieldMode = (typeof FLEET_MODES)[number];

export type ContentField = {
  mode?: FieldMode;
  value?: string;
};

export type StoreInfoFields = {
  name?: ContentField;
  street?: ContentField;
  city?: ContentField;
  province?: ContentField;
  postalCode?: ContentField;
  phone?: ContentField;
  hours?: ContentField;
  area?: ContentField;
  intersection?: ContentField;
  mapsLink?: ContentField;
  mapsEmbed?: ContentField;
  lat?: ContentField;
  lng?: ContentField;
  schemaName?: ContentField;
  website?: ContentField;
};

export type ContentSlot = {
  page: string;
  spot: string;
  mode: FieldMode;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  textBar?: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryName?: string;
};

export type ContentManifest = {
  storeCode: string;
  contentVersion: number;
  bundleUrl: string;
  publishedAt: string;
  jobId: string;
};

export type ContentBundle = {
  schemaVersion: number;
  storeCode: string;
  domain: string;
  contentVersion: number;
  publishedAt: string;
  sourceHash: string;
  jobId: string;
  storeInfo?: StoreInfoFields;
  all?: { slots?: ContentSlot[] };
  slots?: ContentSlot[];
};

export type RejectReason =
  | "http"
  | "invalid-json"
  | "schema-version"
  | "wrong-store"
  | "wrong-domain"
  | "missing-identity"
  | "oversized"
  | "published-at-older"
  | "duplicate-version"
  | "decreasing-version"
  | "bad-image";

export type Nap = {
  name: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  cityLine: string;
  area: string;
  intersection: string;
  areaLine: string;
  phoneDisplay: string;
  phoneTel: string;
  hours: string;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  lat: string;
  lng: string;
  schemaName: string;
  website: string;
};

export type ResolvedBanner = {
  id: "weed" | "promo1" | "vapes" | "welcome";
  page: string;
  spot: string;
  href: string;
  categoryName: string;
  hidden: boolean;
  render: "image" | "text";
  image: string;
  codedImage: string;
  imageWidth?: number;
  imageHeight?: number;
  alt: string;
  title: string;
  textBar: string;
  caption: string;
};

export type ResolvedPage = {
  description: string;
  metaTitle: string;
  metaDescription: string;
};

export type FleetState = {
  active: boolean;
  version: string;
  contentVersion: number | null;
  /** Blob manifest URL. Empty when the site is on coded content. */
  bundleUrl: string;
  renderedAt: string;
  nap: Nap;
  banners: ResolvedBanner[];
  pages: Record<string, ResolvedPage>;
};

export type ManifestHealth = "ok" | "err";
export type ContentMode = "coded" | "bundle";
