import { cigaretteSafeContent } from "./lib/siteConfig";
import CigaretteStateProvider from "./components/CigaretteStateProvider";
import FleetContentProvider from "./components/FleetContentProvider";
import FullNameNap from "./components/FullNameNap";
import PinnedNavClearance from "./components/PinnedNavClearance";
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCigaretteSnapshot, toPublicCigaretteState } from "./lib/cigaretteFeed";
import { getFleetContent } from "./lib/fleetContent";
import { napMatchesCoded } from "./lib/fleet/resolve";
import {
  cannabisStoreJsonLd,
  OG_IMAGE_URL,
  PRIMARY_ORIGIN,
  STORE_NAME,
} from "./lib/store";

export const revalidate = 60;

const ROOT_METADATA: Metadata = {
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

export async function generateMetadata(): Promise<Metadata> {
  const fleet = await getFleetContent();
  if (!fleet.active) return ROOT_METADATA;
  const description = fleet.pages.Home?.metaDescription || "";
  if (!description || description === ROOT_METADATA.description) return ROOT_METADATA;
  return {
    ...ROOT_METADATA,
    description,
    openGraph: { ...ROOT_METADATA.openGraph, description },
    twitter: { ...ROOT_METADATA.twitter, description },
  };
}

async function FleetHead() {
  const fleet = await getFleetContent();
  const baseJsonLd = cigaretteSafeContent(cannabisStoreJsonLd);
  const storeJsonLd = fleet.active && !napMatchesCoded(fleet.nap)
    ? {
        ...baseJsonLd,
        "@graph": Array.isArray(baseJsonLd["@graph"])
          ? baseJsonLd["@graph"].map((node: { [key: string]: unknown }) => node["@type"] === "CannabisStore"
            ? {
                ...node,
                name: fleet.nap.schemaName,
                telephone: fleet.nap.phoneTel,
                url: fleet.nap.website,
                hasMap: fleet.nap.mapsSearchUrl,
                address: {
                  ...(typeof node.address === "object" && node.address ? node.address : {}),
                  streetAddress: fleet.nap.street,
                  addressLocality: fleet.nap.city,
                  addressRegion: fleet.nap.province,
                  postalCode: fleet.nap.postalCode,
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: Number(fleet.nap.lat),
                  longitude: Number(fleet.nap.lng),
                },
              }
            : node)
          : baseJsonLd["@graph"],
      }
    : baseJsonLd;
  return (
    <>
      <meta name="fleet-content-version" content={fleet.version} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}

async function FleetShell({ children }: { children: React.ReactNode }) {
  const [cigaretteSnapshot, fleet] = await Promise.all([getCigaretteSnapshot(), getFleetContent()]);
  return (
    <FleetContentProvider value={{ active: fleet.active, version: fleet.version, nap: fleet.nap }}>
      <CigaretteStateProvider value={toPublicCigaretteState(cigaretteSnapshot)}>
        {children}
        <FullNameNap />
        <PinnedNavClearance />
      </CigaretteStateProvider>
    </FleetContentProvider>
  );
}

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
        <FleetHead />
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
        <FleetShell>{children}</FleetShell>
      </body>
    </html>
  );
}
