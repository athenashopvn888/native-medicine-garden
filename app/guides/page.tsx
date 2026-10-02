import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getGuidesByLane, type GuideLane } from "../lib/guideRegistry";
import styles from "./guides-index.module.css";

const BASE = "https://www.nativemedicinecannabis.com";
const TITLE = "Guides | Native Medicine Garden";
const laneLabels: Record<GuideLane, string> = {
  strain: "Strains",
  native_cig: "Native Cigarettes",
  nic_vape: "Nicotine Vape",
  thc_vape: "THC Vape",
};

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: "Browse every Native Medicine Garden strain, Native Cigarettes, Nicotine Vape, and THC Vape guide.",
  alternates: { canonical: `${BASE}/guides` },
  robots: { index: true, follow: true },
};

export default function GuidesPage() {
  const groups = getGuidesByLane();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${BASE}/guides#webpage`, url: `${BASE}/guides`, name: TITLE, description: metadata.description },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
      ] },
    ],
  };

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar />
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Guides</span></nav>
          <p className={styles.eyebrow}>Name Guide Directory</p>
          <h1>{TITLE}</h1>
          <p>Explore every Native Medicine Garden name guide in one place. Selection changes, so use the current menu to confirm current listings.</p>
        </div>
      </section>
      <div className={styles.wrap}>
        {groups.map(({ lane, guides }) => (
          <section className={styles.group} key={lane}>
            <div className={styles.groupHeading}><h2>{laneLabels[lane]}</h2><span>{guides.length} guides</span></div>
            <div className={styles.grid}>{guides.map((guide) => <Link className={styles.card} href={`/guides/${guide.slug}`} key={guide.slug}><span>{guide.name}</span><small>Read guide →</small></Link>)}</div>
          </section>
        ))}
        <aside className={styles.note}><h2>Looking for current details?</h2><p>These guides explain names and categories. Use the current menu for changing product details and availability.</p><Link href="/weed-resources">Explore Weed Resources</Link></aside>
      </div>
      <Footer />
    </main>
  );
}
