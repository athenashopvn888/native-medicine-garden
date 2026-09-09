import Link from "next/link";

const areas = ["Toronto", "East York", "North York", "York", "Scarborough", "Etobicoke"];

export function DeliveryCoverage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": "https://www.nativemedicinecannabis.com/weed-dispensary-toronto#delivery-service",
    name: "Native Medicine Garden delivery coverage",
    serviceType: "Cannabis delivery information",
    provider: { "@id": "https://www.nativemedicinecannabis.com/#store" },
    url: "https://www.nativemedicinecannabis.com/weed-delivery-toronto",
    areaServed: [
      { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: 43.6584757, longitude: -79.3853271 }, geoRadius: 50000 },
      ...areas.map((name) => ({ "@type": "City", name })),
    ],
  };

  return <section style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 24px 64px" }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <h2>Delivery Coverage from Native Medicine Garden</h2>
    <p>Delivery is coordinated from the Gerrard Street West store and confirmed when an order is placed. A practical planning area is approximately 50 km from downtown Toronto, including Toronto, East York, North York, York, Scarborough and Etobicoke.</p>
    <p>Longer trips toward Barrie, Kitchener or Hamilton may be available when a driver is already positioned in that area. Extended coverage is not guaranteed, so confirm the destination and timing with the dispatcher before relying on delivery.</p>
    <p><Link href="/weed-delivery-toronto">Check current Toronto delivery information</Link></p>
  </section>;
}
