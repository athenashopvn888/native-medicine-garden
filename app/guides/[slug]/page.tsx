import { SHOW_CIGARETTES, hideNativeCigarettePhrase } from "../../lib/siteConfig";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { DELIVERY_GUIDE_REGISTRY, getDeliveryGuide } from "../../lib/deliveryGuideRegistry";
import { GUIDE_REGISTRY, GUIDE_STORE, getGuide, resolveGuideProduct, type GuideEntry } from "../../lib/guideRegistry";
import GuideBody, { stripMarkdown } from "./GuideBody";
import DeliveryGuidePage from "./DeliveryGuidePage";
import styles from "./guide.module.css";

const BASE = `https://${GUIDE_STORE.domain}`;
type GuidePageProps = { params: Promise<{ slug: string }> };
const laneCopy = {
  strain: { label: "Strain name", category: "Cannabis flower" },
  native_cig: { label: "Native Cigarettes", category: "Native Cigarettes" },
  nic_vape: { label: "Nicotine Vape", category: "Nicotine Vape" },
  thc_vape: { label: "THC Vape", category: "THC Vape" },
} as const;

export const dynamicParams = false;
export function generateStaticParams() { return [...GUIDE_REGISTRY, ...DELIVERY_GUIDE_REGISTRY].map((guide) => ({ slug: guide.slug })); }

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const deliveryGuide = getDeliveryGuide(slug);
  if (deliveryGuide) return { title: { absolute: deliveryGuide.title }, description: deliveryGuide.description, alternates: { canonical: `${BASE}/guides/${deliveryGuide.slug}` }, robots: { index: true, follow: true }, openGraph: { title: deliveryGuide.title, description: deliveryGuide.description, url: `${BASE}/guides/${deliveryGuide.slug}`, type: "website" } };
  const guide = getGuide(slug);
  if (!guide) return {};
  const description = stripMarkdown(hideNativeCigarettePhrase(guide.description));
  const title = hideNativeCigarettePhrase(guide.title);
  return {
    title: { absolute: title },
    description,
    keywords: guide.primaryKeywords.map(hideNativeCigarettePhrase).filter(Boolean),
    alternates: { canonical: `${BASE}/guides/${guide.slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, url: `${BASE}/guides/${guide.slug}`, type: "website" },
  };
}

const relatedEntries = (guide: GuideEntry) => guide.relatedSlugs.map(getGuide).filter((entry): entry is GuideEntry => Boolean(entry));

export default async function GuidePage({ params }: GuidePageProps) {
  const slug = (await params).slug;
  const deliveryGuide = getDeliveryGuide(slug);
  if (deliveryGuide) return <DeliveryGuidePage guide={deliveryGuide} />;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const product = resolveGuideProduct(guide);
  const productHref = product ? `${guide.lane === "strain" ? "/flower" : "/item"}/${product.slug}` : undefined;
  const canonical = `${BASE}/guides/${guide.slug}`;
  const lane = !SHOW_CIGARETTES && guide.lane === "native_cig"
    ? { label: "Backwoods", category: "Cigarillos" }
    : laneCopy[guide.lane];
  const guideTitle = hideNativeCigarettePhrase(guide.title);
  const guideDescription = hideNativeCigarettePhrase(guide.description);
  const graph: Record<string, unknown>[] = [{
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
      { "@type": "ListItem", position: 3, name: hideNativeCigarettePhrase(guide.name), item: canonical },
    ],
  }];
  if (guide.schema.types.includes("WebPage")) graph.push({ "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: guideTitle, description: stripMarkdown(guideDescription) });
  if (guide.schema.types.includes("FAQPage")) graph.push({
    "@type": "FAQPage",
    mainEntity: guide.schema.faq_items.filter((faq) => SHOW_CIGARETTES || !/grabba/i.test(`${faq.question} ${faq.answer}`)).map((faq) => ({ "@type": "Question", name: stripMarkdown(hideNativeCigarettePhrase(faq.question)), acceptedAnswer: { "@type": "Answer", text: stripMarkdown(hideNativeCigarettePhrase(faq.answer)) } })),
  });
  if (guide.schema.types.includes("Product")) graph.push({
    "@type": "Product",
    name: guide.name,
    brand: { "@type": "Brand", name: guide.name },
    description: stripMarkdown(guideDescription),
    category: lane.category,
    url: canonical,
  });
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Navbar />
      <article className={styles.article}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/guides">Guides</Link><span>/</span><span>{guide.name}</span></nav>
        <header className={styles.hero}>
          <span className={styles.lane}>{lane.label}</span>
          <h1>{guideTitle}</h1>
          <p className={styles.lede}>{stripMarkdown(guideDescription)}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={productHref ?? guide.preferredCategoryPath}>{productHref ? `Open the ${guide.name} menu listing` : "Check today’s board"}</Link>
            <Link className={styles.secondary} href={guide.preferredCategoryPath}>Browse {lane.category}</Link>
          </div>
        </header>
        <section className={styles.section} aria-label={`${guide.name} guide`}><GuideBody markdown={guide.bodyMd} /></section>
        <section className={styles.section} aria-labelledby="related-guides-heading">
          <h2 id="related-guides-heading">Related {lane.label} guides</h2>
          <div className={styles.related}>{relatedEntries(guide).map((entry) => <Link key={entry.slug} href={`/guides/${entry.slug}`}>{entry.name}<span>{laneCopy[entry.lane].label}</span></Link>)}</div>
        </section>
        <aside className={styles.finalCta}>
          <h2>Check today&apos;s board</h2>
          <p>Use the current menu path for the latest posted listing and format details.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={productHref ?? guide.preferredCategoryPath}>Open today&apos;s menu path</Link>
            <Link className={styles.secondary} href="/visit">Visit {GUIDE_STORE.brand}</Link>
          </div>
        </aside>
      </article>
      <Footer />
    </main>
  );
}
