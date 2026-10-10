import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { AuthorityPage } from "../lib/authorityPages";
import { ADDRESS_LINE, DIRECTIONS_URL, PHONE_DISPLAY, PHONE_TEL, PRIMARY_ORIGIN, STORE_NAME } from "../lib/store";
import styles from "./AuthorityLanding.module.css";
import VapeActionPanel from "./VapeActionPanel";

export default function AuthorityLanding({ page }: { page: AuthorityPage }) {
  const url = `${PRIMARY_ORIGIN}${page.path}`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: page.h1, description: page.summary, isPartOf: { "@id": `${PRIMARY_ORIGIN}/#website` }, about: { "@id": `${PRIMARY_ORIGIN}/#store` } },
    { "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: page.faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
  ] };

  return <main className={styles.main}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <Navbar />
    <section className={styles.hero}><div className={styles.wrap}><span>{page.eyebrow}</span><h1>{page.h1}</h1><p>{page.summary}</p><div className={styles.actions}><Link href={page.menuHref}>{page.menuLabel}</Link><a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">Open Google Maps</a></div></div></section>
    {page.path === "/nicotine-vape-gerrard-bay" && <VapeActionPanel />}
    <section className={styles.content}><div className={styles.layout}><article><h2>At the Gerrard &amp; Bay counter</h2>{page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article><aside><h2>Plan your visit</h2><p><strong>{STORE_NAME}</strong><br />{ADDRESS_LINE}<br /><a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a><br />Open 24 hours, seven days a week</p><p>Adults 19+ with government photo ID.</p><Link href="/visit">TTC, parking and arrival details</Link></aside><section className={styles.faq}><h2>Frequently asked questions</h2>{page.faqs.map((faq) => <details key={faq.q}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</section></div></section>
    <Footer />
  </main>;
}
