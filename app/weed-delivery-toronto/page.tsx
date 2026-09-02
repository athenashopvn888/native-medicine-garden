import type { Metadata } from "next";
import DeliveryContent from "../delivery/DeliveryContent";
import menu from "../delivery/delivery-menu.json";

const canonical = "https://www.nativemedicinecannabis.com/weed-delivery-toronto";

export const metadata: Metadata = {
  title: "Weed Delivery Toronto | Native Medicine Garden Cannabis Dispensary",
  description: "Explore the Native Medicine Garden Weed Delivery menu and contact its dispatcher to confirm current availability and delivery details.",
  alternates: { canonical },
};

export default function WeedDeliveryTorontoPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Native Medicine Garden Weed Delivery",
    url: canonical,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: menu.products.length,
      itemListElement: menu.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
      })),
    },
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /><DeliveryContent /></>;
}
