import type { Metadata } from "next";
import "./globals.css";
import AgeGate from "./components/AgeGate";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nativemedicinecannabis.com"),
  title: {
    default: "Native Medicine Garden | Toronto Dispensary",
    template: "%s | Native Medicine Garden",
  },
  description:
    "Native Medicine Garden is a Toronto cannabis dispensary on Gerrard St W with adult 19+ store info and category browsing for flower, pre-rolls, vapes, edibles, concentrates, and accessories. Open 24 Hours.",
  keywords: [
    "cannabis dispensary Toronto",
    "weed store Toronto",
    "exotic flower Toronto",
    "premium cannabis",
    "Native Medicine Garden",
    "cheap weed Toronto",
    "dispensary near me",
    "THC flower",
    "indica sativa hybrid",
    "edibles Toronto",
    "vapes",
    "pre-rolls",
    "native cigarettes Toronto",
    "weed store Gerrard and Bay",
  ],
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://www.nativemedicinecannabis.com",
    siteName: "Native Medicine Garden",
    title: "Native Medicine Garden — Premium Toronto Cannabis Dispensary",
    description:
      "Browse flower tiers and menu categories at 76 Gerrard St W. Open 24 Hours.",
    images: [
      {
        url: "https://www.nativemedicinecannabis.com/wp-content/uploads/2026/04/46Oi5.jpg",
        width: 1200,
        height: 630,
        alt: "Native Medicine Garden — Native Medicine Garden Toronto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Native Medicine Garden — Toronto's Uplifting Dispensary",
    description:
      "Browse current menu categories. Open 24 Hours at 76 Gerrard St W, Toronto.",
    images: [
      "https://www.nativemedicinecannabis.com/wp-content/uploads/2026/04/46Oi5.jpg",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://www.nativemedicinecannabis.com",
  },
  verification: {
    // google: "your-google-verification-code",
  },
};

/* JSON-LD Structured Data */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  additionalType: "https://schema.org/Store",
  "@id": "https://www.nativemedicinecannabis.com/#store",
  name: "Native Medicine Garden",
  description:
    "Cannabis dispensary at 76 Gerrard St W in Toronto, ON. Shop exotic, premium, AAA+, AA, and budget flower tiers plus edibles, prerolls, and vapes. Open 24 Hours.",
  url: "https://www.nativemedicinecannabis.com",
  telephone: "+14373394466",
  image:
    "https://www.nativemedicinecannabis.com/wp-content/uploads/2026/04/7Clmh.jpg",
  priceRange: "$3 - $12/g",
  address: {
    "@type": "PostalAddress",
    streetAddress: "76 Gerrard St W",
    addressLocality: "Toronto",
    addressRegion: "ON",
    postalCode: "M5G 1J5",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.6586,
    longitude: -79.3854,
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
  areaServed: {
    "@type": "City",
    name: "Toronto",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6586;-79.3854" />
        <meta name="ICBM" content="43.6586, -79.3854" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-R9L5VFEGH8"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R9L5VFEGH8');
            `,
          }}
        />
      </head>
      <body>
        {children}
        <AgeGate />
      </body>
    </html>
  );
}
