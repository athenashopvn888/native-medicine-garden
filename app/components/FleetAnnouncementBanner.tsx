"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FlowerBogoStrip from "./FlowerBogoStrip";

function isThanksgivingNoticeActive(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const dateKey = Number(`${value.year}${value.month}${value.day}`);

  return dateKey >= 20260930 && dateKey <= 20261012;
}

export default function FleetAnnouncementBanner() {
  const [showThanksgivingNotice, setShowThanksgivingNotice] = useState(false);

  useEffect(() => {
    const updateVisibility = () =>
      setShowThanksgivingNotice(isThanksgivingNoticeActive(new Date()));

    updateVisibility();
    const timer = window.setInterval(updateVisibility, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside
      data-fleet-homepage-announcement=""
      aria-label="Store announcements"
    >
      {showThanksgivingNotice ? (
        <p data-thanksgiving-hours-notice="">
          Thanksgiving Monday (Oct 12): We are open regular hours.
        </p>
      ) : null}
      <FlowerBogoStrip hero />
      <Link href="/exotic-weed" data-exotic-tier-banner="" aria-label="Shop Exotic, Premium and AAA+ flower tiers">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/top-weed-tier-nmg01.webp" alt="TOP WEED TIER — Exotic, Premium, and AAA+ flower at Native Medicine Garden — Buy 2g Get 1g FREE and Buy 3g Get 3g FREE." />
      </Link>
      <p data-cigarette-deal="">
        CIGARETTE DEAL ! 2 PACK $5 MIX AND MATCH
      </p>
      <p data-bb-light-deal="">
        EXCLUSIVE SPECIAL PREMIUM GRADE BB FULL, BB LIGHT &amp; BELMONT KING SIZE!
      </p>
      <Link href="/items/cigarettes" data-cig-mix-banner="" aria-label="Shop cigarette mix and match offers">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/2pack5cig.webp" alt="Cigarette deal at Native Medicine Garden — 2 packs for $5 mix and match, cartons $25. Canadian Lights, Menthol, Classics, Goose, Rolled Gold and more." />
      </Link>
      <Link href="/items/cigarettes" data-belmont-premium-banner="" aria-label="Shop BB and Belmont Premium Grade cigarettes">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banners/BB_Belmont_Premium_Grade.webp"
          alt="Exclusive Premium Grade BB Full Flavor, BB Lights, and Belmont King Size cigarettes at Native Medicine Garden."
        />
      </Link>
      <Link href="/items/cigarettes" data-belmont-mix-match-banner="" aria-label="BELMONT KING SIZE $10 - 2PACK BB $5 MIX & MATCH">
        <span data-belmont-offer-lead="">BELMONT KING SIZE $10 -</span>
        <span data-belmont-offer-tail=""> 2PACK BB $5 MIX &amp; MATCH</span>
      </Link>
    </aside>
  );
}
