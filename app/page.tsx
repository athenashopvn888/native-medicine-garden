import type { Metadata } from "next";
import { JsonLd } from "./components/JsonLd";
import HomePageClient from "./HomePageClient";
import { bannerMatchesCoded, homePromosMatchCoded } from "./lib/fleet/resolve";
import { getFleetContent } from "./lib/fleetContent";
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
  const [{ flowers }, fleet] = await Promise.all([getLiveMenu(), getFleetContent()]);
  const contentBanners = fleet.active && !homePromosMatchCoded(fleet.banners) ? fleet.banners : undefined;
  const welcome = fleet.banners.find((banner) => banner.id === "welcome");
  const welcomeBanner = fleet.active && welcome && !bannerMatchesCoded(welcome) ? welcome : undefined;
  return (
    <>
      <JsonLd data={faqPageJsonLd(HOME_FAQS, PRIMARY_ORIGIN)} />
      <HomePageClient initialFlowers={flowers} contentBanners={contentBanners} welcomeBanner={welcomeBanner} />
    </>
  );
}
