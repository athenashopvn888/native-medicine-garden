import Link from "next/link";
import type { ReactNode } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./resources.module.css";
import type { ResourcePage } from "./resourceData";

type ResourceViewProps = { page: ResourcePage };

function inlineText(value: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      : part
  );
}

export default function ResourceView({ page, canonicalPath }: ResourceViewProps & { canonicalPath?: string }) {
  const canonicalUrl = canonicalPath
    ? `https://www.nativemedicinecannabis.com${canonicalPath}`
    : page.slug
    ? `https://www.nativemedicinecannabis.com/resources/${page.slug}`
    : "https://www.nativemedicinecannabis.com/weed-resources";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": page.schemaType || "WebPage", "@id": `${canonicalUrl}#content`, url: canonicalUrl, name: page.title, description: page.description },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.nativemedicinecannabis.com/" },
          { "@type": "ListItem", position: 2, name: "Weed & Cannabis Resources", item: "https://www.nativemedicinecannabis.com/weed-resources" },
          { "@type": "ListItem", position: 3, name: page.title, item: canonicalUrl },
        ],
      },
      ...(page.faqs?.length ? [{ "@type": "FAQPage", mainEntity: page.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }] : []),
    ],
  };

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar />
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className={styles.intro}>{inlineText(page.intro)}</p>
        </div>
      </section>

      {page.lead && page.lead.length > 0 && <section className={styles.lead}>{page.lead.map((paragraph, index) => <p key={index}>{inlineText(paragraph)}</p>)}</section>}

      {page.cards.length > 0 && (
        <section className={styles.cardsSection}>
          <div className={styles.grid}>
            {page.cards.map((card) => <Link key={card.href} href={card.href} className={styles.card}><span>{card.title}</span><p>{card.text}</p></Link>)}
          </div>
        </section>
      )}

      <section className={styles.body}>
        {page.blocks?.map((block, index) => (
          <article key={`${block.heading}-${index}`} className={block.level === 3 ? styles.subsection : styles.section}>
            {block.level === 3 ? <h3>{block.heading}</h3> : <h2>{block.heading}</h2>}
            {block.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{inlineText(paragraph)}</p>)}
            {block.bullets.length > 0 && <ul>{block.bullets.map((item) => <li key={item}>{inlineText(item)}</li>)}</ul>}
            {block.ordered.length > 0 && <ol>{block.ordered.map((item) => <li key={item}>{inlineText(item)}</li>)}</ol>}
          </article>
        ))}
        {!page.blocks && page.sections.map((section) => (
          <article key={section.heading} className={styles.section}><h2>{section.heading}</h2><p>{inlineText(section.body)}</p>{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{inlineText(item)}</li>)}</ul>}</article>
        ))}
        {page.faqs && page.faqs.length > 0 && (
          <section className={styles.faqSection}><h2>FAQs</h2>{page.faqs.map((faq) => <article key={faq.question} className={styles.faqItem}><h3>{faq.question}</h3><p>{inlineText(faq.answer)}</p></article>)}</section>
        )}
      </section>
      <Footer />
    </main>
  );
}
