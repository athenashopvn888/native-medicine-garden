import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { SmokePilotLanding } from "../../components/SmokePilot";
import { getItemsByCategory } from "../../lib/products";

export const metadata: Metadata = {
  title: { absolute: "Nicotine Vapes Gerrard & Bay | Native Medicine Garden" },
  description: "Browse nicotine vape devices, flavours, formats, and listed prices at Native Medicine Garden, 76 Gerrard St W, Toronto. Open 24 Hours.",
  alternates: { canonical: "https://www.nativemedicinecannabis.com/info/nicotine-vapes-gerrard-bay" },
};

export default function NicotineVapesPage() {
  const items = getItemsByCategory("VAPE PENS");
  return (
    <>
      <Navbar />
      <SmokePilotLanding
        canonicalUrl="https://www.nativemedicinecannabis.com/info/nicotine-vapes-gerrard-bay"
        storeName="Native Medicine Garden"
        locationLabel="Gerrard & Bay"
        eyebrow="Nicotine Vapes · Gerrard Street West"
        title="Nicotine Vapes in Gerrard & Bay"
        intro="Shop nicotine vape devices from Geek, OVNS, NEXA, STLTH, Uwell and other listed names at Native Medicine Garden near Gerrard and Bay. Compare formats, flavours, puff counts and prices."
        items={items}
        menuHref="/items/vapes"
        menuLabel="Shop the nicotine vape menu"
        menuHeading="Nicotine Vape Devices & Prices"
        menuIntro="Compare nicotine vape devices, formats and listed prices from Native Medicine Garden in downtown Toronto."
        crossLink={{ href: "/info/native-cigarettes-gerrard-bay", eyebrow: "Also at Native Medicine Garden", title: "Need Native cigarettes instead?", body: "Shop full, light and menthol cigarette styles alongside Backwoods, grabba and other smoke-shop essentials at Native Medicine Garden.", label: "Shop Native cigarettes" }}
        sections={[
          { heading: "Nicotine Vapes Near Gerrard and Bay", body: "Native Medicine Garden lists disposable nicotine vapes, pods and devices at 76 Gerrard St W in downtown Toronto." },
          { heading: "Flavours, Puff Counts and Device Formats", body: "Compare listed options from Geek, OVNS, NEXA, STLTH, Uwell and Level X by device format, flavour and puff count." },
          { heading: "Open 24 Hours Downtown", body: "Native Medicine Garden lists 24-hour shopping for cigarettes, nicotine vapes and other smoke-shop essentials." },
        ]}
        faqs={[
          { q: "Does Native Medicine Garden sell nicotine vapes?", a: "Yes. Native Medicine Garden lists nicotine vape devices with formats, flavours, puff counts and prices." },
          { q: "Are nicotine vapes different from THC vapes?", a: "Yes. Nicotine devices and THC vapes are different product groups, with separate selections for each." },
          { q: "Where is Native Medicine Garden?", a: "Native Medicine Garden is at 76 Gerrard St W, Toronto, ON M5G 1J5 and lists open 24 hours." },
        ]}
        address="76 Gerrard St W, Toronto"
        hours="Open 24 Hours"
        theme="nicotine"
      />
      <Footer />
    </>
  );
}
