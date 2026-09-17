import { Metadata } from "next";
import { GBPLandingPage } from "@/app/components/GBPLandingPage";
import { DeliveryCoverage } from "@/app/components/DeliveryCoverage";
import { gbpLocation } from "@/app/lib/gbp-location";
import { OG_IMAGE_URL, PRIMARY_ORIGIN, STORE_NAME } from "@/app/lib/store";

export const metadata: Metadata = {
  title: {
    absolute: gbpLocation.seoTitle,
  },
  description: gbpLocation.metaDescription,
  alternates: {
    canonical: PRIMARY_ORIGIN,
  },
  openGraph: {
    type: "website",
    url: PRIMARY_ORIGIN,
    title: "Native Medicine Garden | Gerrard & Bay Dispensary",
    description:
      "Walk-in shop at 76 Gerrard St W, Gerrard and Bay, downtown Toronto near College–Bay. Open 24 Hours.",
    images: [
      {
        url: OG_IMAGE_URL,
        width: 2172,
        height: 724,
        alt: `${STORE_NAME} — Gerrard and Bay, downtown Toronto`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Native Medicine Garden | Gerrard & Bay Dispensary",
    description:
      "Walk-in cannabis at 76 Gerrard St W. Address, hours, and directions live on the homepage.",
    images: [OG_IMAGE_URL],
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function Page() {
  return <><GBPLandingPage /><DeliveryCoverage /></>;
}
