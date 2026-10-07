import type { CSSProperties } from "react";

export type TvTheme = {
  headerImage: string;
  backgroundImage: string;
  cornerLeft?: string;
  cornerRight?: string;
  primary: string;
  accent: string;
  glow: string;
  cardBorder: string;
  headerText: string;
  sloganLeft: string;
  sloganRight: string;
  footerLeft: string;
  footerRight: string;
};

export const TV_THEMES: Readonly<Record<string, TvTheme>> = {
  NMG01: {
    headerImage: "/tv-theme/nmg01/header.webp",
    backgroundImage: "/tv-theme/nmg01/background.webp",
    cornerLeft: "/tv-theme/nmg01/corner-left.png",
    cornerRight: "/tv-theme/nmg01/corner-right.png",
    primary: "#113B1E",
    accent: "#D4A73A",
    glow: "rgba(212,167,58,.42)",
    cardBorder: "rgba(255,238,180,.92)",
    headerText: "#FFF8E8",
    sloganLeft: "GROWN WITH CARE",
    sloganRight: "PREMIUM SELECTION",
    footerLeft: "NATIVE MEDICINE GARDEN",
    footerRight: "ROOTED IN QUALITY",
  },
};

export function getTvTheme(storeCode?: string | null): TvTheme | undefined {
  return storeCode ? TV_THEMES[storeCode] : undefined;
}

type TvThemeVariables = CSSProperties & {
  "--tv-theme-header-image": string;
  "--tv-theme-background-image": string;
  "--tv-theme-primary": string;
  "--tv-theme-accent": string;
  "--tv-theme-glow": string;
  "--tv-theme-card-border": string;
  "--tv-theme-header-text": string;
};

export function getTvThemeVariables(theme: TvTheme): TvThemeVariables {
  return {
    "--tv-theme-header-image": `url("${theme.headerImage}")`,
    "--tv-theme-background-image": `url("${theme.backgroundImage}")`,
    "--tv-theme-primary": theme.primary,
    "--tv-theme-accent": theme.accent,
    "--tv-theme-glow": theme.glow,
    "--tv-theme-card-border": theme.cardBorder,
    "--tv-theme-header-text": theme.headerText,
  };
}