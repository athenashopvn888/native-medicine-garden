import { JsonLd } from "./components/JsonLd";
import HomePageClient from "./HomePageClient";
import { HOME_FAQS, PRIMARY_ORIGIN, faqPageJsonLd } from "./lib/store";

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(HOME_FAQS, PRIMARY_ORIGIN)} />
      <HomePageClient />
    </>
  );
}
