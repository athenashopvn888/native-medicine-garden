"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import FleetAnnouncementBanner from "./components/FleetAnnouncementBanner";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FlowerCard from "./components/FlowerCard";
import SmokePilotSpotlight from "./components/SmokePilotSpotlight";
import { allFlowers, type FlowerProduct } from "./lib/products";
import {
  ADDRESS_LINE,
  DIRECTIONS_URL,
  HOME_FAQS,
  HOURS_LABEL,
  MAP_EMBED_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  STORE_NAME,
  STREET_ADDRESS,
} from "./lib/store";
import Papa from "papaparse";

/* -- Bento Mosaic Config -- */
const BENTO_TIERS = [
  {
    name: "EXOTIC WEED",
    slug: "exotic-weed",
    price: "$10-$12/g",
    banner: "/banners/exotics_banner.webp",
    className: styles.bentoExotic,
  },
  {
    name: "PREMIUM WEED",
    slug: "premium-weed",
    price: "$7-$10/g",
    banner: "/banners/premium_banner.webp",
    className: styles.bentoPremium,
  },
  {
    name: "AAA+ WEED",
    slug: "aaa-weed",
    price: "$5-$6/g",
    banner: "/banners/aaa_plus_banner.webp",
    className: styles.bentoTile,
  },
  {
    name: "AA WEED",
    slug: "aa-weed",
    price: "$4/g",
    banner: "/banners/aa_banner.webp",
    className: styles.bentoTile,
  },
  {
    name: "BUDGET WEED",
    slug: "budget-weed",
    price: "$3/g",
    banner: "/banners/budget_banner.webp",
    className: styles.bentoTile,
  },
  {
    name: "EDIBLES - PREROLLS - MORE",
    slug: "items/edibles",
    price: "Shop Tiers",
    banner: "/banners/edibles_prerolls_more_banner.webp",
    className: styles.bentoEdibles,
  },
];

/* -- Explore Categories Config (New Banners) -- */
const EXPLORE_CATEGORIES = [
  { name: "Nicotine Vapes", slug: "items/vapes", banner: "/banners/01_Vape_Pens.webp" },
  { name: "THC Vapes", slug: "items/vape-disposables", banner: "/banners/02_Vape_Disposable.webp" },
  { name: "Concentrates", slug: "items/concentrates", banner: "/banners/03_Concentrates.webp" },
  { name: "Pre-Rolls", slug: "items/prerolls", banner: "/banners/04_Pre_Rolls.webp" },
  { name: "Accessories", slug: "items/add-ons", banner: "/banners/05_Accessories.webp" },
  { name: "Magic Stuff", slug: "items/magic", banner: "/banners/09_Magic_Stuff.webp" },
];

interface Review {
  name: string;
  comment: string;
  date: string;
}

interface ReviewStats {
  total: number;
  avg: number;
}

export default function HomePageClient() {
  const [featuredStrains, setFeaturedStrains] = useState<FlowerProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsStats, setReviewsStats] = useState<ReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  /* -- 1. Fetch Client-Side Google Reviews -- */
  useEffect(() => {
    const STORE_KEY = "NMG01";
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSu6iy9W3YKRzBYo_r96rXcbJsAOzlkzn5Rw9QMFnE0NbYSBgPxKX8kPRZNC9QcffZYj57155esmnqH/pub?gid=1555782756&single=true&output=csv";

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Review feed returned ${r.status}`);
        return r.text();
      })
      .then((raw) => {
        const rows = Papa.parse<Record<string, string>>(raw, {
          header: true,
          skipEmptyLines: true,
        }).data;

        const reviewsPool: Review[] = [];
        let totalVal: number | null = null;
        let avgVal: number | null = null;
        let hasStats = false;

        rows.forEach((row) => {
          if (row.StoreKey !== STORE_KEY) return;

          const rn = row.ReviewerName || "";
          if (rn === "__STATS__") {
            const parsedTotal = parseInt(row.Comment || "", 10);
            const parsedAvg = parseFloat(row.CreateTime || "");
            if (Number.isFinite(parsedTotal) && Number.isFinite(parsedAvg)) {
              totalVal = parsedTotal;
              avgVal = parsedAvg;
              hasStats = true;
            }
            return;
          }

          const comment = row.Comment || "";
          if (!comment || comment.length < 10) return;
          const name = rn || "Customer";
          const dateStr = row.CreateTime || "";
          reviewsPool.push({ name, comment, date: dateStr });
        });

        setReviews(reviewsPool.slice(0, 6));
        if (hasStats && totalVal !== null && avgVal !== null) {
          setReviewsStats({ total: totalVal, avg: avgVal });
        }
        setReviewsLoading(false);
      })
      .catch((err) => {
        console.warn("Reviews fetch failed:", err);
        setReviewsLoading(false);
      });
  }, []);

  /* Featured strains after mount so SSR HTML stays stable. */
  useEffect(() => {
    const pool = [...allFlowers].filter((f) => f.image);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const picked: FlowerProduct[] = [];
    const tierCounts: Record<string, number> = {};

    for (const f of pool) {
      if (picked.length >= 8) break;
      const tc = tierCounts[f.tier] || 0;
      if (tc >= 2) continue;
      if (picked.some((p) => p.name === f.name)) continue;
      picked.push(f);
      tierCounts[f.tier] = tc + 1;
    }

    // Featured sample is mount-only; empty initial state avoids SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFeaturedStrains(picked);
  }, []);

  return (
    <main className={styles.main}>
      <FleetAnnouncementBanner />
      {/* -- NAVBAR -- */}
      <Navbar />

      {/* -- WELCOME BANNER -- */}
      <section className={styles.welcomeBannerSection}>
        <div className={styles.welcomeBannerContainer}>
          <img
            src="/banners/welcome_banner.webp"
            alt="Welcome to Native Medicine Garden at Gerrard and Bay, downtown Toronto"
            className={styles.welcomeBannerImg}
          />
        </div>
      </section>

      {/* -- BENTO MOSAIC HERO -- */}


      <section className={styles.hiringCallout} aria-label="Hiring at Native Medicine Garden">
        <div className={styles.hiringCalloutInner}>
          <div>
            <span className={styles.hiringEyebrow}>Budtenders / Managers Wanted</span>
            <h2>Join Native Medicine</h2>
            <p>Native Medicine is taking online applications for budtender and manager roles. We are looking for motivated, reliable people with calm customer service and strong follow-through. Online applications only. Please do not call the store about hiring.</p>
          </div>
          <Link href="/careers/budtender" className={styles.hiringButton}>Apply Online</Link>
        </div>
      </section>

<section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroStars} />

        <div className={styles.heroContent}>
          {/* Brand branding */}
          <div className={styles.brandBlock}>
            <img src="/storeFavicon.webp" alt="Native Medicine Garden Icon" style={{ height: "60px", width: "60px", objectFit: "contain", borderRadius: "8px", marginBottom: "8px" }} />
            <h1 className={styles.brandTitle}>NATIVE MEDICINE GARDEN CANNABIS DISPENSARY</h1>
            <p className={styles.brandSub}>Walk-in dispensary at Gerrard &amp; Bay, downtown Toronto near College–Bay</p>
            <div className={styles.brandBadge}>Open 24 Hours</div>
          </div>

          {/* Bento Grid */}
          <div className={styles.bentoGrid}>
            {BENTO_TIERS.map((tier) => (
              <Link
                key={tier.slug}
                href={`/${tier.slug}`}
                className={`${styles.bentoTile} ${tier.className}`}
              >
                <div
                  className={styles.bentoTileBg}
                  style={{ backgroundImage: `url('${tier.banner}')` }}
                />
                <div className={styles.bentoTileOverlay} />
                <div className={styles.bentoTileContent}>
                  <span className={styles.bentoLabel}>{tier.name}</span>
                  <span className={styles.bentoPrice}>{tier.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -- EXPLORE CATEGORIES -- */}
      <section className={styles.categoriesSection} id="menu">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explore Categories</h2>
            <p className={styles.sectionSubtitle}>
              From custom disposable vapes and concentrates to accessories and cigarettes.
            </p>
          </div>

          <div className={styles.categoriesGrid}>
            {EXPLORE_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className={styles.categoryCard}
              >
                <div
                  className={styles.categoryCardBg}
                  style={{ backgroundImage: `url('${cat.banner}')` }}
                />
                <div className={styles.categoryCardOverlay} />
                <div className={styles.categoryCardContent}>
                  <h3 className={styles.categoryCardName}>
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SmokePilotSpotlight
        storeName="Native Medicine Garden"
        locationLabel="Gerrard and Bay"
        cigaretteHref="/info/native-cigarettes-gerrard-bay"
        nicotineHref="/info/nicotine-vapes-gerrard-bay"
      />

      {/* -- FEATURED PRODUCTS -- */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Strains</h2>
            <p className={styles.sectionSubtitle}>
              A rotating sample from the current flower menu.
            </p>
          </div>

          <div className={styles.featuredScroll}>
            {featuredStrains.map((strain, i) => (
              <div key={`${strain.sku}-${i}`} className={styles.scrollItem}>
                <FlowerCard flower={strain} tierKey={strain.tier} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- SEO PANEL WRITE-UP -- */}
      <section className={styles.seoSection}>
        <div className={styles.container}>
          <div className={styles.seoPanel}>
            <h2 className={styles.seoPanelTitle}>Walk-in cannabis at Gerrard &amp; Bay — downtown Toronto</h2>
            <p className={styles.seoPanelText}>
              <strong>Native Medicine Garden</strong> is the walk-in shop at 76 Gerrard St W, on Gerrard Street West at Bay Street. The door is a short walk from College–Bay and College Station, with Dundas Station, College Park, and Toronto Metropolitan University on the same downtown core blocks.
            </p>
            <p className={styles.seoPanelText}>
              This homepage is the visit hub: address, listed hours ({HOURS_LABEL}), phone {PHONE_DISPLAY}, and directions. It is a neighbourhood walk-in near College–Bay — not a city-wide delivery landing. Adults 19+ can browse flower tiers, pre-rolls, edibles, vapes, concentrates, accessories, and cigarette category items, then ask staff about current jars and labels.
            </p>
            <p className={styles.seoPanelText}>
              Street parking on Gerrard is easiest in the evening when posted rules allow free parking; daytime visitors should read the signs or use a nearby garage. {HOURS_LABEL}, 7 days a week. For TTC exits, walking cues, and parking detail, use the{" "}
              <Link href="/visit" className={styles.storeLink}>Gerrard &amp; Bay visit guide</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* -- STORE VISIT HUB -- */}
      <section className={styles.storeSection} id="contact">
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Visit {STORE_NAME}</h2>
            <p className={styles.sectionSubtitle}>
              {ADDRESS_LINE} · {PHONE_DISPLAY} · {HOURS_LABEL}
            </p>
          </div>
          <div className={styles.storeGrid}>
            <div className={styles.storeCard}>
              <h3 className={styles.storeCardTitle}>Location</h3>
              <p className={styles.storeCardText}>
                {STREET_ADDRESS}
                <br />
                Toronto, ON M5G 1J5
                <br />
                <span className={styles.storeHighlight}>Gerrard St W &amp; Bay St</span>
              </p>
            </div>
            <div className={styles.storeCard}>
              <h3 className={styles.storeCardTitle}>Hours</h3>
              <p className={styles.storeCardText}>
                Open 7 Days a Week
                <br />
                <span className={styles.storeHighlight}>{HOURS_LABEL}</span>
              </p>
            </div>
            <div className={styles.storeCard}>
              <h3 className={styles.storeCardTitle}>Phone</h3>
              <p className={styles.storeCardText}>
                <a href={`tel:${PHONE_TEL}`} className={styles.storeLink}>
                  {PHONE_DISPLAY}
                </a>
                <br />
                Walk-in · no appointment
              </p>
            </div>
            <div className={styles.storeCard}>
              <h3 className={styles.storeCardTitle}>Walk In</h3>
              <p className={styles.storeCardText}>
                Adults 19+ with photo ID
                <br />
                <span className={styles.storeHighlight}>Near College–Bay</span>
              </p>
            </div>
          </div>

          <div className={styles.visitHubActions}>
            <Link href="/visit" className={styles.visitHubBtn}>
              How to reach Gerrard &amp; Bay
            </Link>
            <a
              href={DIRECTIONS_URL}
              className={styles.visitHubBtnSecondary}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps directions
            </a>
          </div>

          <p className={styles.visitHubNote}>
            Closest subway: College Station and Dundas Station. From College–Bay, walk north on Bay to Gerrard.
            Free evening street parking is available; check posted signs. Full walking and TTC notes are on the visit page.
          </p>

          <div className={styles.mapWrap}>
            <iframe
              title={`Map of ${STORE_NAME} at ${STREET_ADDRESS}`}
              src={MAP_EMBED_URL}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* -- CLIENT-SIDE GOOGLE REVIEWS SHOWCASE -- */}
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>Customer Feedback</h2>
            {reviewsStats && (
              <div className={styles.reviewsStarsSummary}>
                <span className={styles.reviewsStars}>{"\u2605\u2605\u2605\u2605\u2605"}</span>
                <span className={styles.reviewsAvg}>
                  {reviewsStats.avg.toFixed(1)}
                </span>
                <span className={styles.reviewsCount}>
                  ({reviewsStats.total} reviews)
                </span>
              </div>
            )}
          </div>

          <div className={styles.reviewsGrid}>
            {reviewsLoading ? (
              <div className={styles.reviewsLoading}>Loading customer feedback...</div>
            ) : reviews.length === 0 ? (
              <div className={styles.reviewsLoading}>
                Customer feedback is unavailable right now.
              </div>
            ) : (
              reviews.map((rv, idx) => (
                <div key={idx} className={styles.rvCard}>
                  <div className={styles.rvTop}>
                    <div className={styles.rvAvatar}>
                      {rv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.rvMeta}>
                      <span className={styles.rvName}>{rv.name}</span>
                      {rv.date && (
                        <span className={styles.rvDate}>
                          {new Date(rv.date).toLocaleDateString("en-CA", {
                            year: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                    <span className={styles.rvStars}>*****</span>
                  </div>
                  <p className={styles.rvText}>
                    {rv.comment.length > 180 ? `${rv.comment.substring(0, 177)}...` : rv.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className={styles.reviewCtaRow}>
          </div>
        </div>
      </section>

      {/* -- FAQS SECTION -- */}
      <section className={styles.faqSection} id="faq">
        <div className={styles.faqContainer}>
          <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "32px" }}>
            Frequently Asked Questions
          </h2>
          {HOME_FAQS.map((faq, i) => (
            <details key={i} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>{faq.q}</summary>
              <p className={styles.faqAnswer}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* -- FOOTER -- */}
      <Footer />
    </main>
  );
}
