import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Native Medicine Garden In-Store Flower Display",
  description: "Operational in-store flower menu display for Native Medicine Garden.",
  robots: { index: false, follow: false },
};

const HIDE_SITE_CHROME = `
  .deliveryAnnouncement,
  [data-fleet-homepage-announcement],
  [data-cookie-banner],
  [data-cookieconsent],
  #cookie-banner,
  .cookie-banner,
  .cookieBanner {
    display: none !important;
  }
`;

export default function TvLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_SITE_CHROME }} />
      {children}
    </>
  );
}
