import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./seo.module.css";

const ORIGIN = "https://www.nativemedicinecannabis.com";
const PAGE_URL = `${ORIGIN}/hours`;
const TITLE = "Native Medicine Garden Hours | Open 24 Hours at 76 Gerrard St W";
const DESCRIPTION = "Native Medicine Garden at 76 Gerrard St W, Toronto, ON M5G 1J5: open 24 hours. Day-by-day hours, phone +1 (437) 374-4544 and visit links. Adults 19+ with photo ID.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: "website" },
};

const FAQS = [
  { q: "What are Native Medicine Garden's hours?", a: "Open 24 Hours. Day-by-day hours are listed on this page." },
  { q: "Where is Native Medicine Garden?", a: "76 Gerrard St W, Toronto, ON M5G 1J5. Call +1 (437) 374-4544." },
  { q: "Who can shop here?", a: "Adults 19+ with valid government-issued photo ID." },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Store",
      "@id": "https://www.nativemedicinecannabis.com/#store",
      name: "Native Medicine Garden",
      url: ORIGIN,
      telephone: "+14373744544",
      address: { "@type": "PostalAddress", streetAddress: "76 Gerrard St W", addressLocality: "Toronto", addressRegion: "ON", postalCode: "M5G 1J5", addressCountry: "CA" },
      openingHoursSpecification: [{"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "00:00", "closes": "23:59"}],
    },
    { "@type": "WebPage", "@id": `${PAGE_URL}#webpage`, url: PAGE_URL, name: TITLE, description: DESCRIPTION, about: { "@id": "https://www.nativemedicinecannabis.com/#store" } },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: ORIGIN },
        { "@type": "ListItem", position: 2, name: "Store Hours", item: PAGE_URL },
      ],
    },
    { "@type": "FAQPage", "@id": `${PAGE_URL}#faq`, mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
};

export default function HoursPage() {
  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <div className={styles.content}>
        <nav className={styles.crumbs} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Store Hours</span></nav>
        <p className={styles.kicker}>Store hours · Adults 19+</p>
        <h1 className={styles.title}>Native Medicine Garden Hours</h1>
        <p className={styles.lead}>Native Medicine Garden at 76 Gerrard St W in Toronto is open 24 Hours. These are the same hours published in this site&apos;s store details. Adults 19+ with government-issued photo ID.</p>
        <div className={styles.card}>
          <p><strong>Native Medicine Garden</strong></p>
          <p>76 Gerrard St W, Toronto, ON M5G 1J5</p>
          <p>Phone: <a href="tel:+14373744544">+1 (437) 374-4544</a></p>
          <p>Open 24 Hours</p>
          <p><a href="https://www.google.com/maps/search/?api=1&query=76+Gerrard+St+W%2C+Toronto%2C+ON+M5G+1J5" target="_blank" rel="noreferrer">Open in Google Maps</a></p>
        </div>
        <section className={styles.section}>
          <h2>Weekly hours</h2>
          <div className={styles.weekRow}><span>Monday</span><strong>Open 24 hours</strong></div>
          <div className={styles.weekRow}><span>Tuesday</span><strong>Open 24 hours</strong></div>
          <div className={styles.weekRow}><span>Wednesday</span><strong>Open 24 hours</strong></div>
          <div className={styles.weekRow}><span>Thursday</span><strong>Open 24 hours</strong></div>
          <div className={styles.weekRow}><span>Friday</span><strong>Open 24 hours</strong></div>
          <div className={styles.weekRow}><span>Saturday</span><strong>Open 24 hours</strong></div>
          <div className={styles.weekRow}><span>Sunday</span><strong>Open 24 hours</strong></div>
        </section>
        <section className={styles.section}>
          <h2>Plan your visit</h2>
          <div className={styles.ctaRow}>
            <a href="tel:+14373744544" className={`${styles.cta} ${styles.ctaPrimary}`}>Call +1 (437) 374-4544</a>
            <Link href="/" className={styles.cta}>Store menu</Link>
            <Link href="/visit" className={styles.cta}>Visit &amp; directions</Link>
            <Link href="/weed-dispensary-gerrard-bay" className={styles.cta}>Gerrard &amp; Bay dispensary</Link>
          </div>
          <p className={styles.note}>Adults 19+. Government-issued photo ID required.</p>
        </section>
        <section className={styles.section}>
          <h2>Hours FAQs</h2>
          {FAQS.map((f) => (
            <details key={f.q} className={styles.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </div>
      <Footer />
    </main>
  );
}
