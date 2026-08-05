export const TV2_DAYTIME_START_HOUR = 10;
export const TV2_DAYTIME_END_HOUR = 17;

export type Tv2DaytimePromo = {
  src: string;
  alt: string;
};

export const TV2_DAYTIME_PROMOS: Readonly<
  Partial<Record<string, Tv2DaytimePromo>>
> = {
  CIGARETTES: {
    src: "/banners/06_Cigarettes.webp",
    alt: "Native Cigarettes Selection",
  },
  VAPES: {
    src: "/banners/cig-poster-1.png",
    alt: "Vapes Selection",
  },
};

export function isTv2Daytime(now = new Date()): boolean {
  const hour = now.getHours();
  return hour >= TV2_DAYTIME_START_HOUR && hour < TV2_DAYTIME_END_HOUR;
}

export function getTv2DaytimePromo(
  cardId: string,
  daytime: boolean,
): Tv2DaytimePromo | undefined {
  return daytime ? TV2_DAYTIME_PROMOS[cardId] : undefined;
}
