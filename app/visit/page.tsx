import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { JsonLd } from "../components/JsonLd";
import {
  ADDRESS_LINE,
  DIRECTIONS_URL,
  HOURS_DETAIL,
  MAP_EMBED_URL,
  OG_IMAGE_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  PRIMARY_ORIGIN,
  STORE_NAME,
  STREET_ADDRESS,
  VISIT_FAQS,
  faqPageJsonLd,
} from "../lib/store";
import styles from "./visit.module.css";

const canonical = `${PRIMARY_ORIGIN}/visit`;

export const metadata: Metadata = {
  title: "Visit Native Medicine Garden | Gerrard & Bay Walk-In",
  description:
    "How to reach Native Medicine Garden at 76 Gerrard St W, Toronto — Gerrard & Bay walk-in near College–Bay. TTC, parking, hours, and 19+ ID notes.",
  alternates: { canonical },
  openGraph: {
    type: "website",
    url: canonical,
    title: "Visit Native Medicine Garden | Gerrard & Bay",
    description:
      "Walking, TTC, and parking notes for the walk-in shop at 76 Gerrard St W. Homepage remains the visit hub.",
    images: [{ url: OG_IMAGE_URL, width: 2172, height: 724, alt: STORE_NAME }],
  },
};

export default function VisitPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(VISIT_FAQS, canonical)} />
      <main className={styles.main}>
        <Navbar />
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}>Supporting how-to-reach page</p>
            <h1 className={styles.heroTitle}>How to reach Native Medicine Garden at Gerrard &amp; Bay</h1>
            <p className={styles.heroSub}>
              Downtown walk-in at {STREET_ADDRESS}, on Gerrard Street West at Bay Street, near College–Bay.
              Address, hours, phone, and directions stay on the homepage — this page is the corridor reach guide.
            </p>
          </div>
        </section>

        <div className={styles.content}>
          <div className={styles.container}>
            <div className={styles.napGrid}>
              <div className={styles.napCard}>
                <div className={styles.napLabel}>Store</div>
                <p className={styles.napValue}>{STORE_NAME}</p>
              </div>
              <div className={styles.napCard}>
                <div className={styles.napLabel}>Address</div>
                <p className={styles.napValue}>{ADDRESS_LINE}</p>
              </div>
              <div className={styles.napCard}>
                <div className={styles.napLabel}>Phone</div>
                <p className={styles.napValue}>
                  <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
                </p>
              </div>
              <div className={styles.napCard}>
                <div className={styles.napLabel}>Hours</div>
                <p className={styles.napValue}>{HOURS_DETAIL}</p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href="/" className={`${styles.btn} ${styles.btnPrimary}`}>
                Homepage visit hub
              </Link>
              <a
                href={DIRECTIONS_URL}
                className={`${styles.btn} ${styles.btnSecondary}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps directions
              </a>
              <a href={`tel:${PHONE_TEL}`} className={`${styles.btn} ${styles.btnSecondary}`}>
                Call {PHONE_DISPLAY}
              </a>
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Walk from College–Bay</h2>
              <p className={styles.sectionBody}>
                Native Medicine Garden sits on the north side of downtown&apos;s Gerrard Street West strip, just west of
                Bay Street. From the College and Bay corner, walk north on Bay to Gerrard, then look for 76 Gerrard St W.
                The pin is a neighbourhood walk-in — useful if you are already downtown, not a city-wide delivery war.
              </p>
              <p className={styles.sectionBody}>
                College Park and Toronto Metropolitan University sit on the same Gerrard / Bay / College blocks.
                University Avenue is one long block west. The walk north from Eaton Centre and Dundas Station follows
                Bay or Yonge up to Gerrard.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>TTC to Gerrard and Bay</h2>
              <p className={styles.sectionBody}>
                College Station and Dundas Station on Line 1 are the closest subway stops. From College Station, exit
                toward College Street and Bay Street, then walk north to Gerrard. From Dundas Station, walk north toward
                Gerrard Street West. Surface TTC along College, Bay, and Dundas also drops you within a short walk of
                the door.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Parking on Gerrard Street West</h2>
              <p className={styles.sectionBody}>
                Free evening street parking is available when posted rules allow it. Daytime visitors should read the
                current signs on Gerrard Street West and Bay Street or use a nearby garage. Do not treat the curb as
                guaranteed parking — downtown rules change by block and hour.
              </p>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What to bring</h2>
              <ul className={styles.list}>
                <li>Valid government-issued photo ID — adults 19+ only.</li>
                <li>No appointment needed for walk-in browsing.</li>
                <li>Listed hours: {HOURS_DETAIL}.</li>
                <li>Phone {PHONE_DISPLAY} if you need current in-store details before you go.</li>
              </ul>
            </section>

            <div className={styles.mapWrap}>
              <iframe
                title={`Map of ${STORE_NAME} at ${STREET_ADDRESS}`}
                src={MAP_EMBED_URL}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
              {VISIT_FAQS.map((faq) => (
                <details key={faq.q} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{faq.q}</summary>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </details>
              ))}
            </section>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
