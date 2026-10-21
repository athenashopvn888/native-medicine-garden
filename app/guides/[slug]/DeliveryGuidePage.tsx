import { SHOW_CIGARETTES, hideNativeCigarettePhrase } from "../../lib/siteConfig";
import Link from "next/link";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import { DELIVERY_GUIDE_STORE, type DeliveryGuideEntry } from "../../lib/deliveryGuideRegistry";
import DeliveryGuideBody, { stripDeliveryMarkdown } from "./DeliveryGuideBody";
import styles from "./guide.module.css";

const BASE = `https://${DELIVERY_GUIDE_STORE.domain}`;
export default function DeliveryGuidePage({ guide }: { guide: DeliveryGuideEntry }) {
  const canonical = `${BASE}/guides/${guide.slug}`;
  const title = hideNativeCigarettePhrase(guide.title);
  const description = hideNativeCigarettePhrase(guide.description);
  const heading = hideNativeCigarettePhrase(guide.h1);
  const faqs = SHOW_CIGARETTES ? guide.faq_items : guide.faq_items.filter((faq) => !/grabba/i.test(`${faq.question} ${faq.answer}`));
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BASE }, { "@type": "ListItem", position: 2, name: heading, item: canonical }] },
    { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: title, description },
    { "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: stripDeliveryMarkdown(hideNativeCigarettePhrase(faq.question)), acceptedAnswer: { "@type": "Answer", text: stripDeliveryMarkdown(hideNativeCigarettePhrase(faq.answer)) } })) },
  ] };
  return <main className={styles.main}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><Navbar /><article className={styles.article}><nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{heading}</span></nav><header className={styles.hero}><h1>{heading}</h1></header><section className={styles.section} aria-label={`${heading} guide`}><DeliveryGuideBody markdown={hideNativeCigarettePhrase(guide.body_md)} faqs={faqs} /><div className={styles.actions}><Link className={styles.primary} href={guide.action_path}>{guide.main_button}</Link><Link className={styles.secondary} href={guide.category_path}>{guide.second_button}</Link></div></section></article><Footer /></main>;
}
