import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AgeGate from "./components/AgeGate";
import {
  cannabisStoreJsonLd,
  OG_IMAGE_URL,
  PRIMARY_ORIGIN,
  STORE_NAME,
} from "./lib/store";

export const metadata: Metadata = {
  metadataBase: new URL(PRIMARY_ORIGIN),
  title: {
    default: "Native Medicine Garden | Gerrard & Bay Dispensary",
    template: "%s | Native Medicine Garden",
  },
  description:
    "Walk-in cannabis dispensary at 76 Gerrard St W, Gerrard & Bay, downtown Toronto near College–Bay. Flower, pre-rolls, vapes, edibles, concentrates, and accessories. Open 24 Hours. Adults 19+.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: PRIMARY_ORIGIN,
    siteName: STORE_NAME,
    title: "Native Medicine Garden | Gerrard & Bay Dispensary",
    description:
      "Walk-in shop at 76 Gerrard St W, Gerrard and Bay, downtown Toronto near College–Bay. Open 24 Hours.",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 2172,
        height: 724,
        alt: "Native Medicine Garden — Gerrard and Bay, downtown Toronto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Native Medicine Garden | Gerrard & Bay Dispensary",
    description:
      "Walk-in cannabis at 76 Gerrard St W, Gerrard & Bay, downtown Toronto. Open 24 Hours.",
    images: [OG_IMAGE_URL],
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
    canonical: PRIMARY_ORIGIN,
  },
  verification: {
    // google: "your-google-verification-code",
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
        <meta name="geo.placename" content="Gerrard and Bay, Toronto" />
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(cannabisStoreJsonLd).replace(/</g, "\\u003c"),
          }}
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
        <Link className="deliveryAnnouncement" href="/weed-delivery-toronto">
          EXPLORE WEED DELIVERY
        </Link>
        {children}
        <AgeGate />
      </body>
    </html>
  );
}
