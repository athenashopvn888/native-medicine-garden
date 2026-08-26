import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { SmokePilotLanding } from "../../components/SmokePilot";

export const metadata: Metadata = {
  title: { absolute: "Nicotine Vapes near Gerrard and Bay | Native Medicine Garden" },
  description: "Adults 19+: review six nicotine vape product pages from Native Medicine Garden, then check /items/vapes. Nicotine is addictive.",
  alternates: { canonical: "https://www.nativemedicinecannabis.com/info/nicotine-vapes-gerrard-bay" },
};

export default function NicotineVapesPage() {
  return <><Navbar /><SmokePilotLanding
    canonicalUrl="https://www.nativemedicinecannabis.com/info/nicotine-vapes-gerrard-bay"
    storeName="Native Medicine Garden"
    locationLabel="Downtown Toronto / Bay Street"
    eyebrow="NATIVE MEDICINE GARDEN • DOWNTOWN TORONTO / BAY STREET • ADULTS 19+"
    title="Nicotine Vapes at Native Medicine Garden"
    intro="Searching for nicotine vapes near me around downtown Toronto or Bay Street? This adult-only guide features six live-checked VAPE PENS product pages. Compare their supported names, then use /items/vapes for the current nicotine category. Product details can change. Nicotine is addictive."
    items={[]} menuHref="/items/vapes" menuLabel="Browse Nicotine Vapes"
    menuHeading="Six Live-Checked Native Medicine Garden Vape Cards"
    menuIntro="This shortlist contains six live-checked Beast Mode, Geek, Level X, NEXA and OVNS VAPE PENS product pages. Use each card for its supported display name, then rely on /items/vapes for the current category listing."
    heroItems={[
      { name: "BEAST MODE MAX – MANY FLAVORS", image: "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/1091-Beast-Mode-Max.webp" },
      { name: "GEEK PROMAX – 5% | 30K PUFFS", image: "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/GEEK-PROMAX.jpg" },
      { name: "GEEK UNIVERSE 25k PUFFS", image: "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/geek_universe_pulse_x_25k.webp" },
      { name: "Level X G2 pod", image: "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/1086-Level-X-G2-pod.webp" },
      { name: "NEXA PIX | 30K PUFFS | MANY FLAVORS", image: "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/nexa_showcase_600x600.webp" },
      { name: "OVNS 10000 – 5% | 10K PUFFS", image: "https://pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev/products/1081OVNS10000.jpg" },
    ]}
    heroDisclosure="Featured cards are live-checked starting points, not guarantees of current stock, price or availability."
    showMenuGrid={false} secondaryHref="#featured-vapes" secondaryLabel="Compare the Six Featured Items"
    identityLabel="Downtown Toronto / Bay Street · Adults 19+ · Nicotine is addictive."
    sections={[
      { heading: "Read Each Product Format Carefully", body: "One featured page explicitly identifies a Level X G2 pod. Keep that description attached only to that product and do not relabel another featured item by assumption." },
      { heading: "Puff Counts Identify Listings", body: "Several featured names include puff counts. Use those numbers to distinguish listings, not as guarantees of duration, performance or superiority." },
      { heading: "Keep Nicotine and Cannabis Vape Routes Separate", body: "This guide uses VAPE PENS products under /items/vapes. THC and cannabis vape products under /items/vape-disposables are excluded." },
      { heading: "Review the Current Category", body: "Open /items/vapes and the individual product page for current supported details. This guide does not claim prices, stock or guaranteed availability." },
    ]}
    faqs={[
      { q: "Where should I check the current nicotine selection?", a: "Use /items/vapes. The current category listing controls selection information." },
      { q: "Does every featured item use the same format?", a: "No format should be assumed. Read each current product page for supported details." },
      { q: "Does this page include cannabis vapes?", a: "No. THC and cannabis vape products under /items/vape-disposables are excluded." },
    ]}
    theme="nicotine" warning="Adults 19+. Nicotine is addictive."
  /><Footer /></>;
}
