import { cache } from "react";
import {
  cigarettePublicHeaders,
  decideCigaretteGuide,
  decideCigaretteSurface,
  reconcileSurfaceItems,
  type CigaretteSurfaceDecision,
  type CigaretteWording,
} from "./cigDecision";
import { allItems, type ItemProduct } from "./products";
import { cigaretteEnvHardOff } from "./siteConfig";

export type CigaretteSnapshot = {
  web: CigaretteSurfaceDecision;
  tv: CigaretteSurfaceDecision;
  guides: CigaretteSurfaceDecision;
  wording: CigaretteWording;
  live: boolean;
  items: ItemProduct[];
};

export type PublicCigaretteState = {
  web: boolean;
  tv: boolean;
  wording: CigaretteWording;
};

const DEFAULT_MENU_URL =
  "https://script.google.com/macros/s/AKfycbx09_sDal1eMVF1r-hUck4e7oq_XBHEWhGvA79JuhZNQ6P4CdhCas0xE3FfexWQ3hq4/exec";

let lastGood: { cig: unknown; items: ItemProduct[] } | null = null;
let memory: { at: number; snap: CigaretteSnapshot } | null = null;

export function resetCigaretteFeedCache(): void {
  lastGood = null;
  memory = null;
}

function menuUrl(): string {
  const raw = (process.env.MENU_FEED_URL || "").trim();
  const base = raw || DEFAULT_MENU_URL;
  return `${base}${base.includes("?") ? "&" : "?"}store=NMG01`;
}

function snapshotFrom(cig: unknown, items: ItemProduct[], live: boolean, errored: boolean): CigaretteSnapshot {
  const web = decideCigaretteSurface({ cig, items, surface: "web", errored });
  const tv = decideCigaretteSurface({ cig, items, surface: "tv", errored });
  const guides = decideCigaretteGuide({ cig, items, errored });
  return { web, tv, guides, wording: web.wording, live, items };
}

async function loadCigaretteFeed(): Promise<CigaretteSnapshot> {
  if (cigaretteEnvHardOff()) return snapshotFrom(null, allItems, false, false);
  try {
    const response = await fetch(menuUrl(), { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json() as { cig?: unknown; items?: ItemProduct[] };
    const items = Array.isArray(data?.items) && data.items.length ? data.items : allItems;
    const cig = data?.cig ?? null;
    if (cig && typeof cig === "object") lastGood = { cig, items };
    return snapshotFrom(cig, items, true, false);
  } catch {
    if (lastGood) return snapshotFrom(lastGood.cig, lastGood.items, false, false);
    return snapshotFrom(null, allItems, false, true);
  }
}

export async function readCigaretteFeed(): Promise<CigaretteSnapshot> {
  if (memory && Date.now() - memory.at < 60_000) return memory.snap;
  const snap = await loadCigaretteFeed();
  memory = { at: Date.now(), snap };
  return snap;
}

export const getCigaretteSnapshot = cache(readCigaretteFeed);

export function toPublicCigaretteState(snap: CigaretteSnapshot): PublicCigaretteState {
  return { web: snap.web.show, tv: snap.tv.show, wording: snap.wording };
}

export function snapshotHeaders(snap: CigaretteSnapshot): Record<string, string> {
  return cigarettePublicHeaders({ web: snap.web.show, tv: snap.tv.show, wording: snap.wording });
}

/** Explicit feed off (or a live shelf with no real cigarettes) stays on the URL. */
export function cigarettePageUnavailable(decision: CigaretteSurfaceDecision): boolean {
  return !decision.show && (decision.reason === "off" || decision.reason === "no-items");
}

export { reconcileSurfaceItems };
