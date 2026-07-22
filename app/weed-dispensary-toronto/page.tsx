import { Metadata } from "next";
import { GBPLandingPage } from "@/app/components/GBPLandingPage";
import { gbpLocation } from "@/app/lib/gbp-location";

export const metadata: Metadata = {
  title: {
    absolute: gbpLocation.seoTitle,
  },
  description: gbpLocation.metaDescription,
  alternates: {
    canonical: `https://${gbpLocation.domain}/${gbpLocation.slug}`,
  },
  openGraph: {
    type: "website",
    url: `https://${gbpLocation.domain}/${gbpLocation.slug}`,
    title: gbpLocation.seoTitle,
    description: gbpLocation.metaDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: gbpLocation.seoTitle,
    description: gbpLocation.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <GBPLandingPage />;
}
