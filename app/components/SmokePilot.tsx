import type { CSSProperties } from "react";
import Link from "next/link";
import type { ItemProduct } from "../lib/products";
import SmokePilotImage from "./SmokePilotImage";
import styles from "./SmokePilot.module.css";

interface LandingSection {
  heading: string;
  body: string;
}

interface LandingFaq {
  q: string;
  a: string;
}

interface SmokePilotLandingProps {
  canonicalUrl: string;
  storeName: string;
  locationLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: ItemProduct[];
  menuHref: string;
  menuLabel: string;
  menuHeading: string;
  menuIntro: string;
  crossLink: {
    href: string;
    eyebrow: string;
    title: string;
    body: string;
    label: string;
  };
  sections: LandingSection[];
  faqs: LandingFaq[];
  address: string;
  hours: string;
  theme: "cigarettes" | "nicotine";
  inventoryVersion?: string;
  inventoryAsOf?: string;
}

function displayPrice(price: string) {
  if (!price) return "See menu";
  return price.startsWith("$") ? price : `$${price}`;
}

function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function SmokePilotLanding({
  canonicalUrl,
  storeName,
  locationLabel,
  eyebrow,
  title,
  intro,
  items,
  menuHref,
  menuLabel,
  menuHeading,
  menuIntro,
  crossLink,
  sections,
  faqs,
  address,
  hours,
  theme,
  inventoryVersion,
  inventoryAsOf,
}: SmokePilotLandingProps) {
  const featuredItems = items.filter((item) => item.image).slice(0, 4);
  const menuItems = items.slice(0, 12);
  const themeStyle = {
    "--pilot-accent": theme === "cigarettes" ? "#e7b85b" : "#9a78ff",
    "--pilot-accent-soft": theme === "cigarettes" ? "#6d4917" : "#4d2c91",
    "--pilot-glow": theme === "cigarettes" ? "rgba(231, 184, 91, .3)" : "rgba(154, 120, 255, .34)",
  } as CSSProperties;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl.split("/info/")[0] },
      { "@type": "ListItem", position: 2, name: title, item: canonicalUrl },
    ],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <main
      className={styles.landing}
      style={themeStyle}
      data-inventory-version={inventoryVersion}
      data-inventory-as-of={inventoryAsOf}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />

      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span>/</span><span>{locationLabel}</span>
            </nav>
            <span className={styles.kicker}>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className={styles.heroActions}>
              <Link href={menuHref} className={styles.primaryButton}>{menuLabel}</Link>
              <a href="#menu-highlights" className={styles.secondaryButton}>See the selection</a>
            </div>
            <div className={styles.storeLine}>
              <span>{storeName}</span><i /> <span>{address}</span><i /> <span>{hours}</span>
            </div>
          </div>

          <div className={styles.productStage} aria-label={`${title} menu preview`}>
            {featuredItems.length > 0 ? featuredItems.map((item, index) => (
              <Link
                key={`${item.sku}-${item.name}`}
                href={`/item/${item.slug}`}
                className={styles.stageProduct}
                style={{ "--stage-index": index } as CSSProperties}
              >
                <SmokePilotImage src={item.image} alt={item.name} loading={index === 0 ? "eager" : "lazy"} />
                <span>{item.name}</span>
              </Link>
            )) : (
              <div className={styles.stageEmpty}>
                <span>{theme === "cigarettes" ? "CG" : "NV"}</span>
                <strong>Ask about today&apos;s selection</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={styles.menuSection} id="menu-highlights">
        <div className={styles.contentWidth}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.kicker}>Current selection</span>
              <h2>{menuHeading}</h2>
            </div>
            <p>{menuIntro}</p>
          </div>

          {menuItems.length > 0 ? (
            <div className={styles.productGrid}>
              {menuItems.map((item) => (
                <Link key={`${item.sku}-${item.name}`} href={`/item/${item.slug}`} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <SmokePilotImage src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className={styles.productBody}>
                    <span>{theme === "cigarettes" ? "Cigarettes" : "Nicotine Vape"}</span>
                    <h3>{item.name}</h3>
                    <strong>{displayPrice(item.price)}</strong>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.noItems}>Selection can change. Ask the store about today&apos;s options.</div>
          )}

          <div className={styles.centerAction}>
            <Link href={menuHref} className={styles.primaryButton}>{menuLabel}</Link>
          </div>
        </div>
      </section>

      <section className={styles.guideSection}>
        <div className={styles.contentWidth}>
          <div className={styles.guideGrid}>
            {sections.map((section, index) => (
              <article key={section.heading} className={styles.guideCard}>
                <span>0{index + 1}</span>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>

          <Link href={crossLink.href} className={styles.crossSell}>
            <div>
              <span className={styles.kicker}>{crossLink.eyebrow}</span>
              <h2>{crossLink.title}</h2>
              <p>{crossLink.body}</p>
            </div>
            <strong>{crossLink.label} <b aria-hidden="true">→</b></strong>
          </Link>
        </div>
      </section>

      <section className={styles.visitSection}>
        <div className={styles.contentWidth}>
          <div className={styles.visitCard}>
            <div><span className={styles.kicker}>Visit {storeName}</span><h2>{address}</h2></div>
            <strong>{hours}</strong>
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqWrap}>
          <span className={styles.kicker}>Quick answers</span>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.q} className={styles.faqItem}>
                <summary>{faq.q}<span aria-hidden="true">+</span></summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

