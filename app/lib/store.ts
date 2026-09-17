/** Single-store NAP and local SEO constants for Native Medicine Garden.
 *  GBP Website field must remain the homepage root
 *  `https://www.nativemedicinecannabis.com/` — never `/visit` or `/weed-dispensary-*`.
 */
export const PRIMARY_HOST = "www.nativemedicinecannabis.com";
export const PRIMARY_ORIGIN = `https://${PRIMARY_HOST}`;
export const STORE_NAME = "Native Medicine Garden";
export const STREET_ADDRESS = "76 Gerrard St W";
export const CITY = "Toronto";
export const REGION = "ON";
export const POSTAL_CODE = "M5G 1J5";
export const COUNTRY = "CA";
export const ADDRESS_LINE = "76 Gerrard St W, Toronto, ON M5G 1J5";
export const PHONE_DISPLAY = "+1 (437) 374-4544";
export const PHONE_TEL = "+14373744544";
export const HOURS_LABEL = "Open 24 Hours";
export const HOURS_DETAIL = "Open 24 Hours, 7 days a week";
export const INTERSECTION = "Gerrard Street West and Bay Street";
export const OG_IMAGE_PATH = "/banners/welcome_banner.webp";
export const OG_IMAGE_URL = `${PRIMARY_ORIGIN}${OG_IMAGE_PATH}`;
export const LOGO_URL = `${PRIMARY_ORIGIN}/storeFavicon.webp`;
export const MAP_EMBED_URL =
  "https://www.google.com/maps?q=76%20Gerrard%20St%20W%2C%20Toronto%2C%20ON%20M5G%201J5&output=embed";
export const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=76%20Gerrard%20St%20W%2C%20Toronto%2C%20ON%20M5G%201J5";
export const GEO = { latitude: 43.6586, longitude: -79.3854 };
export const GBP_MAPS_CID = "https://www.google.com/maps?cid=10755313457698171095";
export const LEGACY_CA_HOSTS = [
  "nativemedicinegarden.ca",
  "www.nativemedicinegarden.ca",
] as const;

export type FaqItem = { q: string; a: string };

/** Homepage FAQs — location, hours, products. Must match visible homepage copy. */
export const HOME_FAQS: FaqItem[] = [
  {
    q: "Where is Native Medicine Garden?",
    a: "Native Medicine Garden is a walk-in cannabis dispensary at 76 Gerrard St W, Toronto, ON M5G 1J5, on Gerrard Street West at Bay Street in downtown Toronto. Call +1 (437) 374-4544.",
  },
  {
    q: "What are the hours for Native Medicine Garden?",
    a: "Native Medicine Garden at 76 Gerrard St W, Toronto is Open 24 Hours a day, 7 days a week. Walk in anytime — no appointment needed.",
  },
  {
    q: "How do I get to Native Medicine Garden at Gerrard and Bay?",
    a: "The shop is on Gerrard Street West just west of Bay Street, a short walk from College–Bay and from College Station, with Dundas Station on the same downtown blocks. Free evening street parking is available; check posted signs. Walking, TTC, and parking notes are on the visit page.",
  },
  {
    q: "What cannabis products can I browse?",
    a: "Adults 19+ can browse five flower tiers: Exotic ($10-$12/g), Premium ($7-$10/g), AAA+ ($5-$6/g), AA ($4/g), and Budget ($3/g), plus edibles, pre-rolls, vapes, concentrates, accessories, and cigarette category items. Confirm current listings on the menu or in store.",
  },
  {
    q: "Do I need ID to walk in?",
    a: "Yes. Shoppers must be 19+ and present valid government-issued photo ID. Walk-ins are welcome and no appointment is required.",
  },
];

/** /visit supporting how-to-reach FAQs — must match the visit page. */
export const VISIT_FAQS: FaqItem[] = [
  {
    q: "What is the exact address for Native Medicine Garden?",
    a: "76 Gerrard St W, Toronto, ON M5G 1J5, at Gerrard Street West and Bay Street. Phone +1 (437) 374-4544. Listed hours are Open 24 Hours.",
  },
  {
    q: "Which TTC stops are closest to Gerrard and Bay?",
    a: "College Station and Dundas Station on Line 1 are the closest subway stops. From College–Bay, walk north on Bay Street to Gerrard Street West. The store is a downtown walk-in, not a city-wide delivery desk.",
  },
  {
    q: "Is there parking near 76 Gerrard St W?",
    a: "Free evening street parking is available on nearby blocks when posted rules allow it. Daytime visitors should read current street signs or use a nearby garage. Do not block the Gerrard Street West curb.",
  },
  {
    q: "What landmarks help find the shop?",
    a: "Use Gerrard & Bay as the pin. College Park, Toronto Metropolitan University, University Avenue, and the walk north from Eaton Centre / Dundas Station all land you on the same downtown core blocks.",
  },
  {
    q: "What should I bring for a walk-in visit?",
    a: "Valid government-issued photo ID showing you are 19+. No appointment is needed. The homepage remains the visit hub for hours, phone, and menu links.",
  },
];

export function faqPageJsonLd(faqs: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export const cannabisStoreJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CannabisStore",
      "@id": `${PRIMARY_ORIGIN}/#store`,
      name: STORE_NAME,
      description:
        "Walk-in cannabis dispensary at 76 Gerrard St W, Gerrard and Bay, downtown Toronto near College–Bay. Flower tiers, pre-rolls, edibles, vapes, concentrates, and accessories. Open 24 Hours.",
      url: PRIMARY_ORIGIN,
      telephone: PHONE_TEL,
      image: OG_IMAGE_URL,
      logo: LOGO_URL,
      priceRange: "$3 - $12/g",
      address: {
        "@type": "PostalAddress",
        streetAddress: STREET_ADDRESS,
        addressLocality: CITY,
        addressRegion: REGION,
        postalCode: POSTAL_CODE,
        addressCountry: COUNTRY,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: GEO.latitude,
        longitude: GEO.longitude,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
      ],
      areaServed: [
        { "@type": "Place", name: "Gerrard and Bay, Toronto" },
        { "@type": "Place", name: "Downtown Toronto" },
      ],
      sameAs: [GBP_MAPS_CID],
      hasMap: GBP_MAPS_CID,
    },
    {
      "@type": "WebSite",
      "@id": `${PRIMARY_ORIGIN}/#website`,
      url: `${PRIMARY_ORIGIN}/`,
      name: STORE_NAME,
      publisher: { "@id": `${PRIMARY_ORIGIN}/#store` },
    },
  ],
};
