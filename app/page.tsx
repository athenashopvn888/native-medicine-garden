import type { Metadata } from "next";
import { JsonLd } from "./components/JsonLd";
import HomePageClient from "./HomePageClient";
import { getLiveMenu } from "./lib/liveMenu";
import { HOME_DOC_TITLE, HOME_TITLE } from "./lib/homeDelivery";
import { HOME_FAQS, PRIMARY_ORIGIN, faqPageJsonLd } from "./lib/store";

export const metadata: Metadata = {
  title: { absolute: HOME_DOC_TITLE },
  openGraph: { title: HOME_DOC_TITLE, siteName: HOME_TITLE },
  twitter: { card: "summary_large_image", title: HOME_DOC_TITLE },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { flowers } = await getLiveMenu();
  return (
    <>
      <JsonLd data={faqPageJsonLd(HOME_FAQS, PRIMARY_ORIGIN)} />
      <HomePageClient initialFlowers={flowers} />
    </>
  );
}
