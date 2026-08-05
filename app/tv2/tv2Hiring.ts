export const TV2_HIRING_INTERVAL_MS = 3_000;

export const TV2_HIRING_SLIDES = [
  "NOW HIRING BUDTENDERS & MANAGERS",
  "APPLY ONLINE",
  "nativemedicinecannabis.com",
] as const;

export const TV2_HIRING_REDUCED_MOTION_MESSAGE =
  "NOW HIRING BUDTENDERS & MANAGERS · APPLY ONLINE · nativemedicinecannabis.com";

export function getNextTv2HiringSlide(current: number): number {
  return (current + 1) % TV2_HIRING_SLIDES.length;
}
