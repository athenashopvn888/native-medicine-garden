import Link from "next/link";
import styles from "./GBPLandingPage.module.css";
import { gbpLocation } from "../lib/gbp-location";

// Dictionary mapping category names to their respective paths
const categoryLinks: { [key: string]: string } = {
  "Flower": "/",
  "Pre-rolls": "/items/prerolls",
  "Edibles": "/items/edibles",
  "THC vapes": "/items/vape-disposables",
  "Concentrates": "/items/concentrates",
  "Shatter": "/items/concentrates",
  "CBD oils": "/items/concentrates",
  "Accessories": "/items/add-ons"
};
type WebPageSchemaMarkup = {
  "@context": string;
  "@type": string;
  "@id": string;
  name: string;
  url: string;
  description: string;
  about: {
    "@id": string;
  };
};

export function GBPLandingPage() {
  const landmarkList = gbpLocation.localLandmarks.join(", ");
  const nearbyAreaList = gbpLocation.nearbyAreas.slice(0, 4).join(", ");
  const categoryGuideLinks = gbpLocation.products.slice(0, 6).map((product) => ({
    label: product,
    href: categoryLinks[product] || "/"
  }));
  const canonicalUrl = `https://${gbpLocation.domain}/${gbpLocation.slug}`;
  // Describe this landing page without defining a second, competing Store entity.
  const schemaMarkup: WebPageSchemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    "name": gbpLocation.seoTitle,
    "url": canonicalUrl,
    "description": gbpLocation.metaDescription,
    "about": {
      "@id": `https://${gbpLocation.domain}/#store`
    }
  };

  return (
    <div className={styles.container}>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Hero Header */}
      <header className={styles.hero}>
        <h1 className={styles.h1}>{gbpLocation.storeName} — Weed Dispensary in {gbpLocation.city}</h1>
        <p className={styles.heroTagline}>Serving {gbpLocation.city} & Nearby Neighborhoods</p>
      </header>

      {/* Call to Actions */}
      <div className={styles.btnRow}>
        <a href={gbpLocation.menuUrl} className={`${styles.btn} ${styles.btnPrimary}`}>
          View Menu
        </a>
        <a href={`tel:${gbpLocation.phoneIntl}`} className={`${styles.btn} ${styles.btnSecondary}`}>
          Call Store
        </a>
      </div>

      {/* Intro Section */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Local Store Information</h2>
        <p className={styles.introText}>{gbpLocation.introVariant}</p>
      </section>

      {/* Product Section */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Browse Menu Categories</h2>
        <p className={styles.infoText}>
          Adults 19+ can use these links to browse the store&apos;s menu categories. Check the current menu for specific products, prices, and availability before visiting:
        </p>
        <div className={styles.productGrid}>
          {gbpLocation.products.map((p) => {
            const href = categoryLinks[p] || "/";
            return (
              <Link key={p} href={href} className={styles.productCard}>
                {p}
              </Link>
            );
          })}
        </div>
      </section>
      {/* Visit Planning Section */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Plan a Visit to {gbpLocation.storeName}</h2>
        <p className={styles.infoText}>
          Use this page to confirm the basics before visiting {gbpLocation.storeName} near {gbpLocation.neighborhood}. The store page brings together the address, phone number, menu links, nearby-area context, and adult 19+ shopping notes for customers comparing cannabis stores around {gbpLocation.city}.
        </p>
        <p className={styles.infoBlock}>
          Helpful local reference points include {landmarkList}. Customers also use this page when planning from {nearbyAreaList}.
        </p>
        <p className={styles.infoText}>
          For a fuller local overview, read the{" "}
          <Link href="/">Home</Link>.
        </p>
      </section>

      {/* Location & NAP Section */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Visit {gbpLocation.storeName} in {gbpLocation.city}</h2>
        <div className={styles.napGrid}>
          <div className={styles.napDetails}>
            <div className={styles.napItem}>
              <span className={styles.napLabel}>Store Name</span>
              <strong>{gbpLocation.storeName}</strong>
            </div>
            <div className={styles.napItem}>
              <span className={styles.napLabel}>Address</span>
              <span>{gbpLocation.address}</span>
            </div>
            <div className={styles.napItem}>
              <span className={styles.napLabel}>Phone</span>
              <span><a href={`tel:${gbpLocation.phoneIntl}`} style={{ color: "inherit" }}>{gbpLocation.phone}</a></span>
            </div>
            <div className={styles.napItem}>
              <span className={styles.napLabel}>Website</span>
              <span><a href={`https://${gbpLocation.domain}/`} style={{ color: "inherit" }}>https://{gbpLocation.domain}/</a></span>
            </div>
            {gbpLocation.hours && gbpLocation.hours.length > 0 && (
              <div className={styles.napItem}>
                <span className={styles.napLabel}>Store Hours</span>
                {gbpLocation.hours.map((line) => (
                  <span key={line} style={{ fontSize: "0.95rem" }}>{line}</span>
                ))}
              </div>
            )}
            <div className={styles.napItem} style={{ marginTop: "10px" }}>
              <p className={styles.infoBlock} style={{ fontSize: "0.9rem", fontStyle: "italic", margin: 0 }}>
                * {gbpLocation.parkingNote}.
              </p>
            </div>
          </div>
          <div className={styles.mapWrapper}>
            {gbpLocation.mapEmbedUrl ? (
              <>
                <iframe
                  title={`Map of ${gbpLocation.storeName}`}
                  src={gbpLocation.mapEmbedUrl}
                  className={styles.mapIframe}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={gbpLocation.directionsUrl}
                  className={styles.mapDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions in Google Maps
                </a>
              </>
            ) : (
              <a
                href={gbpLocation.directionsUrl}
                className={styles.mapDirections}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions in Google Maps
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Nearby Areas Section */}
      <section className={styles.section}>
        <h2 className={styles.h2}>{gbpLocation.sectionTitle}</h2>
        <p className={styles.infoText}>
          {gbpLocation.neighborhoodDescription} {gbpLocation.transitNote}. Nearby reference points include:
        </p>
        <div className={styles.areaList}>
          {gbpLocation.nearbyAreas.map((area) => (
            <span key={area} className={styles.areaTag}>
              {area}
            </span>
          ))}
        </div>
      </section>
      {/* Category Link Context Section */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Compare Menu Categories Before You Visit</h2>
        <p className={styles.infoText}>
          These category links help adults 19+ browse general menu sections before visiting. Use the current menu for listed product names, prices, and package details.
        </p>
        <div className={styles.productGrid}>
          {categoryGuideLinks.map((category) => (
            <Link key={category.label} href={category.href} className={styles.productCard}>
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className={styles.section}>
        <h2 className={styles.h2}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>How should I plan a visit to {gbpLocation.storeName}?</h3>
            <p className={styles.faqAnswer}>
              Check the store address, phone number, hours, menu links, and nearby-area notes on this page before visiting. {gbpLocation.storeName} serves adults 19+ near {gbpLocation.neighborhood} and surrounding {gbpLocation.city} areas.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Can I use this page to compare menu categories?</h3>
            <p className={styles.faqAnswer}>
              Yes. The category links on this page are intended to help adults 19+ compare general menu sections such as flower, pre-rolls, edibles, vapes, concentrates, and accessories before checking the live menu.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Where is {gbpLocation.storeName} located?</h3>
            <p className={styles.faqAnswer}>{gbpLocation.storeName} is located at {gbpLocation.address}.</p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Is {gbpLocation.storeName} a weed dispensary in {gbpLocation.city}?</h3>
            <p className={styles.faqAnswer}>
              {gbpLocation.storeName} is a cannabis store at {gbpLocation.address}. Customers must be at least 19 years old and present valid government-issued photo identification.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>What products does {gbpLocation.storeName} carry?</h3>
            <p className={styles.faqAnswer}>
              The menu is organized into categories such as flower, pre-rolls, edibles, concentrates, vapes, CBD oils, and accessories. Check the current menu for specific products and availability.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Do I need to be 19+ to shop at {gbpLocation.storeName}?</h3>
            <p className={styles.faqAnswer}>
              Yes, to visit our cannabis store or order from our menu, you must be at least 19 years of age. Valid government-issued photo ID is required for verification.
            </p>
          </div>
          {gbpLocation.neighborhood && (
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Is {gbpLocation.storeName} near {gbpLocation.neighborhood}?</h3>
              <p className={styles.faqAnswer}>
                Yes, {gbpLocation.storeName} is located near {gbpLocation.neighborhood} and serves customers from nearby landmarks like {gbpLocation.localLandmarks.join(", ")}.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
