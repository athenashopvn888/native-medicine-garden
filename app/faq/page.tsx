import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "FAQ Native Medicine Garden | Toronto Dispensary Questions",
  description:
    "Frequently asked questions about Native Medicine Garden at 76 Gerrard St W, Toronto, ON M5G 1J5. Hours, location, products, category browsing, and visit planning.",
  alternates: {
    canonical: "https://nativemedicinecannabis.com/faq",
  },
};

const FAQ_CATEGORIES = [
  {
    title: "Location And Hours",
    faqs: [
      {
        q: "Where is Native Medicine Garden located?",
        a: "Native Medicine Garden is located at 76 Gerrard St W, Toronto, ON M5G 1J5, near Gerrard Street West and Bay Street.",
      },
      {
        q: "What are your hours?",
        a: "Native Medicine Garden is open 24 hours. Check the site or call (437) 339-4466 if you need current visit details.",
      },
      {
        q: "Is there parking nearby?",
        a: "Parking details vary by block and time of day. Check local signs before parking near 76 Gerrard St W.",
      },
      {
        q: "What local areas does this store focus on?",
        a: "Native Medicine Garden is centered on Gerrard Street West, Bay Street, Yonge Street, College Park, Toronto Metropolitan University, University Avenue, Downtown Toronto.",
      },
      {
        q: "What is the best way to get there?",
        a: "Use 76 Gerrard St W as the address anchor, then choose the transit, walking, or driving route that fits your visit.",
      },
    ],
  },
  {
    title: "Products And Menu",
    faqs: [
      {
        q: "What products can shoppers browse?",
        a: "The site includes flower tiers, pre-rolls, edibles, vapes, concentrates, cigarettes, and accessories for adult 19+ shoppers.",
      },
      {
        q: "Does the online page guarantee current inventory?",
        a: "No. Category pages support browsing. Confirm current product availability on the live menu or in store.",
      },
      {
        q: "What are the flower tiers?",
        a: "Flower is organized into clear tiers such as Exotic, Premium, AAA+, AA, and Budget so shoppers can compare category information before visiting.",
      },
      {
        q: "Do you sell edibles and vapes?",
        a: "Yes, the site has category guides for edibles, vape pens, disposable vapes, and related menu items when listed.",
      },
      {
        q: "Do you list cigarette information?",
        a: "Yes. Cigarette category information is available, but current brands and pricing should be confirmed in store.",
      },
    ],
  },
  {
    title: "Shopping And Delivery",
    faqs: [
      {
        q: "Do I need an appointment?",
        a: "The site is built for browsing before visiting. Check current store details if you need a specific shopping requirement.",
      },
      {
        q: "Can I order online?",
        a: "Use the menu to browse current categories before visiting. Ordering and pickup details may vary by store process.",
      },
      {
        q: "Do you offer delivery?",
        a: "Delivery is marked coming soon unless the store announces that service is live. Use the delivery page to sign up for launch updates.",
      },
      {
        q: "Can staff help me choose a strain?",
        a: "Ask in store for help comparing tiers, product types, and current menu options.",
      },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_CATEGORIES.flatMap((cat) =>
      cat.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    ),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className={styles.main}>
        <Navbar />
        <section
          style={{ width: "100%", overflow: "hidden", marginTop: "92px" }}
        >
          <img
            src="/banners/07_FAQ.webp"
            alt="Native Medicine Garden FAQ"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </section>

        <div className={styles.content}>
          <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>
          <p className={styles.pageSubtitle}>
            Answers for Native Medicine Garden shoppers near Gerrard Street West
            and Bay Street.
          </p>

          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.title} className={styles.category}>
              <h2 className={styles.categoryTitle}>{cat.title}</h2>
              {cat.faqs.map((faq) => (
                <details key={faq.q} className={styles.faqItem}>
                  <summary className={styles.faqQuestion}>{faq.q}</summary>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </details>
              ))}
            </div>
          ))}

          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>Still have questions?</h2>
            <p className={styles.ctaText}>
              Call us at <strong>(437) 339-4466</strong> or visit us at 76
              Gerrard St W, Toronto.
            </p>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
