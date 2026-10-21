import { SHOW_CIGARETTES } from "../../lib/siteConfig";
import CigaretteSeasonalNotice from "../../components/CigaretteSeasonalNotice";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import CategoryCoreBanners, { cigaretteCategoryImage } from "../../components/CategoryCoreBanners";
import SafeImage from "../../components/SafeImage";
import { getItemPriceDisplay } from "../../lib/itemPricing";
import Footer from "../../components/Footer";
import {
  getCategoryFromSlug,
  CATEGORY_CONFIG,
  type ItemProduct,
} from "../../lib/products";
import styles from "./items.module.css";
import { getCategoryGuideGroups } from "../../lib/guideRegistry";
import { liveItemsByCategory } from "../../lib/liveMenu";
import VapeActionPanel from "../../components/VapeActionPanel";

// Read the live menu feed on every request (never a build-time snapshot).
export const dynamic = "force-dynamic";

/* ── Generate all category pages ── */
export function generateStaticParams() {
  return Object.values(CATEGORY_CONFIG).map((c) => ({ category: c.slug }));
}

/* ── SEO ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: catSlug } = await params;
  const catInfo = getCategoryFromSlug(catSlug);
  if (!catInfo) return {};
  const preservedShelf = catSlug === "cigarettes" && !SHOW_CIGARETTES;
  const items = (await liveItemsByCategory(catInfo.key));

  return {
    title: preservedShelf ? "Backwoods, cigarillos and rolling papers" : (catInfo.config.seoTitle || `${catInfo.config.name} — ${items.length} Products`),
    description: preservedShelf ? "Backwoods, cigarillos and rolling papers at Native Medicine Garden, 76 Gerrard St W. Open 24 Hours." : (catInfo.config.seoIntro || `Shop ${items.length} ${catInfo.config.name.toLowerCase()} at Native Medicine Garden.`),
    alternates: {
      canonical: `https://www.nativemedicinecannabis.com/items/${catSlug}`,
    },
  };
}

export default async function ItemsCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: catSlug } = await params;
  const catInfo = getCategoryFromSlug(catSlug);
  if (!catInfo) notFound();
  const preservedShelf = catSlug === "cigarettes" && !SHOW_CIGARETTES;

  /* Pre-Rolls also shows accessories (ADD ONS) */
  let items = (await liveItemsByCategory(catInfo.key));
  if (catInfo.key === "PREROLLS") {
    const accessories = (await liveItemsByCategory("ADD ONS"));
    const existingIds = new Set(items.map(i => i.sku));
    const uniqueAccessories = accessories.filter(a => !existingIds.has(a.sku));
    items = [...items, ...uniqueAccessories];
  }
  const { config } = catInfo;
  const guideGroups = getCategoryGuideGroups(`/items/${catSlug}`);

  return (
    <main className={styles.main}>
      <Navbar />
      {catSlug === "cigarettes" && <CigaretteSeasonalNotice sticky />}

      {/* Hero Banner */}
      <section style={{ width: "100%", overflow: "hidden", marginTop: "92px", marginBottom: "24px" }}>
        {config.banner && !preservedShelf ? (
          <img
            src={config.banner}
            alt={catSlug === "cigarettes" ? cigaretteCategoryImage.alt : config.name}
              title={catSlug === "cigarettes" ? cigaretteCategoryImage.title : config.name}
            style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
          />
        ) : (
          <div className={styles.heroContent} style={{ background: config.color, padding: "60px 24px", textAlign: "center" }}>
            <span className={styles.heroIcon}>{preservedShelf ? "BW" : config.icon}</span>
            <h1 className={styles.heroTitle}>
              <span style={{ color: "#fff" }}>{preservedShelf ? "Backwoods" : config.name}</span>
            </h1>
            <p className={styles.heroSub} style={{ color: "rgba(255,255,255,0.8)" }}>{preservedShelf ? "Cigarillos and rolling papers" : `${items.length} products available`}</p>
          </div>
        )}
      </section>

      {(catSlug === "vapes" || catSlug === "vape-disposables") && <CategoryCoreBanners kind="vapes" />}
      {catSlug === "cigarettes" && <CategoryCoreBanners kind="cigarettes" />}

      {guideGroups.map((group)=><section className="guideStrip" key={group.label} aria-label={group.label}><h2>{group.label}</h2><div className="guideLinks">{group.guides.map((guide)=><Link key={guide.slug} href={`/guides/${guide.slug}`}>{guide.name}</Link>)}</div></section>)}

      {/* Product Grid */}
      <section className={styles.products}>
        <div className={styles.container}>
          {items.length > 0 ? (
            <div className={styles.grid}>
              {items.map((item) => (
                <ItemCard key={item.sku} item={item} catColor={config.color} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🌱</span>
              <h3>Coming Soon</h3>
              <p>We&apos;re stocking this category. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
      {(catInfo.key === "VAPE PENS" || catInfo.key === "VAPE DISPOSABLE") && <VapeActionPanel />}

      {/* SEO Content */}
      <section className={styles.seoSection}>
        <div className={styles.container}>
          <h2 className={styles.seoTitle}>{preservedShelf ? "Backwoods, cigarillos and rolling papers" : config.seoTitle}</h2>
          <p className={styles.seoBody}>{preservedShelf ? "Backwoods, cigarillos and rolling papers stay on the shelf at Native Medicine Garden, 76 Gerrard St W." : config.seoDescription}</p>

          {/* FAQ */}
          {(preservedShelf ? [] : config.faqs).length > 0 && (
            <div className={styles.faqBlock}>
              <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
              {(preservedShelf ? [] : config.faqs).map((faq, i) => (
                <details key={i} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{faq.q}</summary>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </details>
              ))}
            </div>
          )}

          {/* Visit CTA */}
          <div className={styles.visitCta}>
            <h3 className={styles.visitTitle}>Visit Native Medicine Garden</h3>
            <p className={styles.visitText}>
              76 Gerrard St W, Toronto, ON M5G 1J5 · Open 24 Hours
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function shelfLabel(item: ItemProduct) {
  if (SHOW_CIGARETTES) return item.category;
  const label = `${item.name} ${item.slug}`;
  if (/grabba/i.test(label)) return item.category;
  if (/backwoods|cigarillos?/i.test(label)) return "Backwoods";
  if (/rolling[- ]?papers?|raw[- ]?papers?/i.test(label)) return "Rolling papers";
  return item.category;
}

function ItemCard({ item, catColor }: { item: ItemProduct; catColor: string }) {
  const itemPrice = getItemPriceDisplay(item.price, item.sku);

  return (
    <Link href={`/item/${item.slug}`} className={styles.card} style={{ "--cat-color": catColor } as React.CSSProperties}>
      <div className={styles.cardMedia}>
        {item.image ? (
          <SafeImage 
            src={item.image} 
            alt={item.name} 
            loading="lazy" 
            className={styles.cardImg} 
          />
        ) : (
          <div className={styles.cardPlaceholder}>
            {item.name[0]}
          </div>
        )}
        <div className={styles.cardBadges}>
          {item.thc && <span className={styles.badgeThc}>{item.thc}</span>}
          {item.mg && <span className={styles.badgeMg}>{item.mg}</span>}
        </div>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardCategory}>{shelfLabel(item)}</span>
        <h3 className={styles.cardName}>{item.name}</h3>
        {item.price && (
          <div className={styles.cardPrice}>
            <span className={styles.priceVal}>{itemPrice.display}</span>
            <span className={styles.priceUnit}>{itemPrice.isMultiple ? "price options" : "each"}</span>
          </div>
        )}
        <span className={styles.skuTag}>SKU {item.sku}</span>
      </div>
    </Link>
  );
}
