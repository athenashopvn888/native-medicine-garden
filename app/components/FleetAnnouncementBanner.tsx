"use client";

import { SHOW_CIGARETTES } from "../lib/siteConfig";

import CigaretteSeasonalNotice from "./CigaretteSeasonalNotice";

import Link from "next/link";
import HomeTitleBlock from "./HomeTitleBlock";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { bannerMatchesCoded } from "../lib/fleet/resolve";
import type { ResolvedBanner } from "../lib/fleet/types";

const STORE_NAME = "Native Medicine Garden";
const STORE_AREA = "Gerrard & Bay";
const STORE_ORIGIN = "https://www.nativemedicinecannabis.com";
const TOP_WEED_IMAGE = "/banners/top-weed-tier-nmg01.webp";
const CIGARETTE_IMAGE = "/banners/2pack5cig.webp";
const VAPE_IMAGE = "/banners/core-vapes-nicotine-thc.webp";
const PREMIUM_CIGARETTE_IMAGE = "/banners/core-premium-bb-marlboro-belmont.webp";

const imageObjects = [
  { name: `${STORE_NAME} top weed tiers`, description: `Exotic, Premium and AAA+ weed tiers at ${STORE_NAME} in ${STORE_AREA}.`, contentUrl: `${STORE_ORIGIN}${TOP_WEED_IMAGE}` },
  { name: `${STORE_NAME} nicotine and THC vapes`, description: `Nicotine vapes and THC vapes at ${STORE_NAME} in ${STORE_AREA}.`, contentUrl: `${STORE_ORIGIN}${VAPE_IMAGE}` },
  { name: `${STORE_NAME} cigarette mix and match`, description: `Two packs for $5 mix and match and $25 carton cigarette offer at ${STORE_NAME} in ${STORE_AREA}.`, contentUrl: `${STORE_ORIGIN}${CIGARETTE_IMAGE}` },
  { name: `${STORE_NAME} premium cigarette offer`, description: `BB Full Flavor and Lights plus Marlboro and Belmont cigarette offer at ${STORE_NAME} in ${STORE_AREA}.`, contentUrl: `${STORE_ORIGIN}${PREMIUM_CIGARETTE_IMAGE}` },
].filter((image) => SHOW_CIGARETTES || !/cigarette|marlboro|belmont/i.test(`${image.name} ${image.description}`)).map((image) => ({ "@type": "ImageObject", ...image, caption: image.description }));

function isHalloweenNoticeActive(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const dateKey = Number(`${value.year}${value.month}${value.day}`);
  return dateKey >= 20261014 && dateKey <= 20261031;
}

const figureStyle = { margin: 0, width: "100%" } as const;
const imageStyle = { display: "block", width: "100%", maxWidth: "100%", height: "auto" } as const;
const linkStyle = { display: "block", width: "100%" } as const;
const captionStyle = { margin: 0, padding: "10px 14px", background: "#111827", color: "#ffffff", textAlign: "center" as const, fontWeight: 800, lineHeight: 1.35 };

function renderHomeSpot(banners: ResolvedBanner[] | undefined, id: ResolvedBanner["id"], fallback: ReactNode) {
  if (!banners?.length) return fallback;
  const banner = banners.find((entry) => entry.id === id);
  if (!banner || banner.hidden || banner.id === "welcome") return null;
  if (bannerMatchesCoded(banner)) return fallback;
  return <SheetBanner banner={banner} />;
}

function SheetBanner({ banner }: { banner: ResolvedBanner }) {
  const [src, setSrc] = useState(banner.image);
  const [imageFailed, setImageFailed] = useState(false);
  const showText = banner.render === "text" || imageFailed;
  return (
    <figure data-core-banner={banner.id} style={figureStyle}>
      {showText ? (
        <div data-fleet-text-banner="" style={{ ...imageStyle, minHeight: banner.imageHeight || 180, display: "flex", alignItems: "center", justifyContent: "center", background: "#111827", color: "#ffffff", fontWeight: 800, fontSize: "clamp(28px, 4vw, 48px)" }}>{banner.categoryName}</div>
      ) : (
        <Link href={banner.href} style={linkStyle}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={src} alt={banner.alt} title={banner.title} width={banner.imageWidth} height={banner.imageHeight} style={imageStyle} onError={() => {
          if (banner.codedImage && src !== banner.codedImage) {
            setSrc(banner.codedImage);
            return;
          }
          setImageFailed(true);
        }} /></Link>
      )}
      <figcaption data-fleet-text-bar="" style={captionStyle}>{banner.textBar}</figcaption>
      {banner.caption && banner.caption !== banner.textBar ? <figcaption data-fleet-caption="" style={captionStyle}>{banner.caption}</figcaption> : null}
    </figure>
  );
}

export default function FleetAnnouncementBanner({ title, banners }: { title: string; banners?: ResolvedBanner[] }) {
  const announcementRef = useRef<HTMLElement>(null);
  const [navClearance, setNavClearance] = useState<number | null>(null);
  const [showHalloweenNotice, setShowHalloweenNotice] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowHalloweenNotice(isHalloweenNoticeActive(new Date()));
    updateVisibility();
    const timer = window.setInterval(updateVisibility, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const announcement = announcementRef.current;
    const nav = document.getElementById("main-nav");
    if (!announcement || !nav) return;
    let frame = 0;
    const updateClearance = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        // Document coordinates (scroll-safe); only a fixed nav overlaps page flow.
        const currentMargin = Number.parseFloat(window.getComputedStyle(announcement).marginTop) || 0;
        const flowTopDoc = announcement.getBoundingClientRect().top + window.scrollY - currentMargin;
        const nextClearance = window.getComputedStyle(nav).position === "fixed" ? Math.min(400, Math.max(0, Math.ceil(nav.getBoundingClientRect().bottom - flowTopDoc))) : 0;
        setNavClearance((current) => current === nextClearance ? current : nextClearance);
      });
    };
    updateClearance();
    const resizeObserver = new ResizeObserver(updateClearance);
    resizeObserver.observe(nav);
    window.addEventListener("resize", updateClearance);
    return () => { window.cancelAnimationFrame(frame); resizeObserver.disconnect(); window.removeEventListener("resize", updateClearance); };
  }, []);

  return (
    <aside ref={announcementRef} data-fleet-homepage-announcement="" data-nav-clearance-self="" aria-label="Store announcements" style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "100%", overflowX: "hidden", marginTop: navClearance === null ? undefined : navClearance, position: "relative", zIndex: 50 }}>
      <HomeTitleBlock title={title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": imageObjects }).replace(/</g, "\\u003c") }} />
      {renderHomeSpot(banners, "weed", (
      <figure data-core-banner="weed" data-exotic-tier-banner="" style={figureStyle}><Link href="/exotic-weed" aria-label={`Shop Exotic, Premium and AAA+ weed tiers at ${STORE_NAME}`} style={linkStyle}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={TOP_WEED_IMAGE} alt={`${STORE_NAME} in ${STORE_AREA} — Exotic, Premium and AAA+ top weed tiers`} title={`${STORE_NAME} top weed tiers — Exotic, Premium and AAA+`} style={imageStyle} /></Link><figcaption style={captionStyle}>Top 3 tiers only (Exotic, Premium, AAA+): Buy 2g Get 1g FREE · Buy 3g Get 3g FREE (6g)</figcaption></figure>
      ))}
      {renderHomeSpot(banners, "promo1", null)}
      {renderHomeSpot(banners, "vapes", (
      <figure data-core-banner="vapes" data-vape-banner="" style={figureStyle}><Link href="/items/vapes" aria-label={`Shop nicotine vapes and THC vapes at ${STORE_NAME}`} style={linkStyle}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={VAPE_IMAGE} alt={`${STORE_NAME} in ${STORE_AREA} — nicotine vapes and THC vapes`} title={`${STORE_NAME} nicotine vapes and THC vapes`} style={imageStyle} loading="lazy" /></Link><figcaption style={captionStyle}>Nicotine + THC vapes</figcaption></figure>
      ))}
      {SHOW_CIGARETTES ? <CigaretteSeasonalNotice /> : null}
      {SHOW_CIGARETTES ? (<figure data-core-banner="cigarettes" data-cig-mix-banner="" style={figureStyle}><Link href="/items/cigarettes" aria-label={`Shop cigarette mix and match offers at ${STORE_NAME}`} style={linkStyle}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={CIGARETTE_IMAGE} alt={`${STORE_NAME} in ${STORE_AREA} — 2 packs for $5 mix and match and $25 carton cigarette offer`} title={`${STORE_NAME} cigarette offer — 2 packs $5 mix and match, $25 carton`} style={imageStyle} loading="lazy" /></Link><figcaption style={captionStyle}>2 PACKS $5 / $25 CARTON</figcaption></figure>) : null}
      {SHOW_CIGARETTES ? (<figure data-core-banner="premium-cigarettes" data-premium-cigarette-banner="" style={figureStyle}><Link href="/items/cigarettes" aria-label={`Shop BB, Marlboro and Belmont cigarette offers at ${STORE_NAME}`} style={linkStyle}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={PREMIUM_CIGARETTE_IMAGE} alt={`${STORE_NAME} in ${STORE_AREA} — BB Full Flavor and Lights, Marlboro and Belmont premium cigarettes`} title={`${STORE_NAME} premium cigarettes — BB, Marlboro and Belmont`} style={imageStyle} loading="lazy" /></Link><figcaption style={captionStyle}>BB Full Flavor + Lights 2 packs $5 · Marlboro &amp; Belmont $10/pack</figcaption></figure>) : null}
      {showHalloweenNotice ? <p data-halloween-hours-notice="">Happy Halloween! {STORE_NAME} is open regular hours on Saturday, October 31.</p> : null}
    </aside>
  );
}
