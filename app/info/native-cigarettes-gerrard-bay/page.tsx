import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { SMOKE_PILOT_HERO_DISCLOSURE, SmokePilotLanding } from "../../components/SmokePilot";
import { getItemsByCategory } from "../../lib/products";

export const metadata: Metadata = {
  title: { absolute: "Native Cigarettes Gerrard & Bay | Native Medicine Garden" },
  description: "Browse Native cigarette brands, pack styles, and listed prices at Native Medicine Garden, 76 Gerrard St W, Toronto. Open 24 Hours.",
  alternates: { canonical: "https://www.nativemedicinecannabis.com/info/native-cigarettes-gerrard-bay" },
};

const HERO_ITEMS = [
  { name: "BB Lights", image: "/products/1001-BB-LIGHTS-CARTONS.webp" },
  { name: "BB Full", image: "/products/1003-BB-FULL-CARTON.webp" },
  { name: "Canadian Lights", image: "/products/1005-CANADIAN-LIGHTS.webp" },
  { name: "Canadian Full", image: "/products/1006-CANADIAN-FULL.webp" },
  { name: "Canadian Classics Silver", image: "/products/1015-CANADIAN-CLASSICS-SILVER.webp" },
  { name: "Canadian Menthol", image: "/products/1013-CANADIAN-MENTHOL.webp" },
] as const;

export default function NativeCigarettesPage() {
  const items = getItemsByCategory("CIGARETTES");
  return (
    <>
      <Navbar />
      <SmokePilotLanding
        canonicalUrl="https://www.nativemedicinecannabis.com/info/native-cigarettes-gerrard-bay"
        storeName="Native Medicine Garden"
        locationLabel="Gerrard & Bay"
        eyebrow="Native Cigarettes · Gerrard Street West"
        title="Native Cigarettes Near Gerrard and Bay"
        intro="Shop Native cigarette brands, full, light and menthol styles, plus Backwoods, grabba and nicotine pouches at Native Medicine Garden near Gerrard and Bay."
        items={items}
        menuHref="/items/cigarettes"
        menuLabel="Shop the cigarette menu"
        menuHeading="Native Cigarette Brands & Prices"
        menuIntro="Compare cigarette brands, styles and listed prices from Native Medicine Garden in downtown Toronto."
        crossLink={{ href: "/info/nicotine-vapes-gerrard-bay", eyebrow: "Also at Native Medicine Garden", title: "Prefer a nicotine vape?", body: "Shop nicotine vape devices with brand, flavour, puff-count and listed price details from Native Medicine Garden.", label: "Shop nicotine vapes" }}
        sections={[
          { heading: "Native Cigarettes Near Gerrard and Bay", body: "Native Medicine Garden carries Native cigarettes and smoke-shop essentials at 76 Gerrard St W in downtown Toronto." },
          { heading: "Canadian Brands Downtown", body: "Compare listed Canadian, Canadian Goose, Canadian Classics, Nexus, Time and Putters options near Toronto's downtown core." },
          { heading: "Grabba, Backwoods and Pouches Near Bay Street", body: "The listed smoke-shop selection includes grabba, grabba shakers, Backwoods and nicotine pouches alongside cigarette options." },
        ]}
        faqs={[
          { q: "Does Native Medicine Garden sell Native cigarettes?", a: "Yes. Native Medicine Garden lists Native cigarette brands and related smoke-shop products at 76 Gerrard St W, Toronto." },
          { q: "Can I see cigarette prices online?", a: "Yes. Listed prices appear with the cigarette selection, and staff can confirm current shelf details when you visit." },
          { q: "Where is Native Medicine Garden?", a: "Native Medicine Garden is at 76 Gerrard St W, Toronto, ON M5G 1J5 and lists open 24 hours." },
        ]}
        address="76 Gerrard St W, Toronto"
        hours="Open 24 Hours"
        theme="cigarettes"
        heroItems={HERO_ITEMS}
        heroDisclosure={SMOKE_PILOT_HERO_DISCLOSURE}
      />
      <Footer />
    </>
  );
}
