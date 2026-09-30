"use client";

import { useEffect, useState } from "react";

const lineStyle = {
  margin: 0,
  padding: "14px 16px",
  color: "#fff",
  fontSize: "clamp(18px, 3vw, 32px)",
  fontWeight: 900,
  lineHeight: 1.15,
  letterSpacing: "0.02em",
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
};

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

export default function FleetAnnouncementBanner({
  holidayOnly = false,
}: {
  holidayOnly?: boolean;
}) {
  const [showThanksgivingNotice, setShowThanksgivingNotice] = useState(false);

  useEffect(() => {
    const updateVisibility = () =>
      setShowThanksgivingNotice(isThanksgivingNoticeActive(new Date()));

    updateVisibility();
    const timer = window.setInterval(updateVisibility, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (holidayOnly && !showThanksgivingNotice) return null;

  return (
    <aside
      data-fleet-homepage-announcement=""
      aria-label="Store announcements"
      style={{ width: "100%", position: "relative", zIndex: 50 }}
    >
      {showThanksgivingNotice ? (
        <p
          data-thanksgiving-hours-notice=""
          style={{ ...lineStyle, background: "#166534" }}
        >
          Thanksgiving Monday (Oct 12): We are open regular hours. Confirm
          today&apos;s hours on this page before you visit.
        </p>
      ) : null}
      {!holidayOnly ? (
        <>
          <p style={{ ...lineStyle, background: "#b91c1c" }}>
            CIGARETTE DEAL ! 2 PACK $5 MIX AND MATCH
          </p>
          <p style={{ ...lineStyle, background: "#c2410c" }}>
            EXCLUSIVE SPECIAL PREMIUM GRADE BB FULL &amp; BB LIGHT!
          </p>
        </>
      ) : null}
    </aside>
  );
}
