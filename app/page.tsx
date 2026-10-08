import type { Metadata } from "next";
import { JsonLd } from "./components/JsonLd";
import HomePageClient from "./HomePageClient";
import { HOME_TITLE } from "./lib/homeDelivery";
import { HOME_FAQS, PRIMARY_ORIGIN, faqPageJsonLd } from "./lib/store";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  openGraph: { title: HOME_TITLE, siteName: HOME_TITLE },
  twitter: { card: "summary_large_image", title: HOME_TITLE },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(HOME_FAQS, PRIMARY_ORIGIN)} />
      <HomePageClient />
    </>
  );
}
