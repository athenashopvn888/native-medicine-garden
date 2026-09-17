import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nativemedicinecannabis.com" },
      { protocol: "https", hostname: "kennedyloudcannabis.com" },
      { protocol: "https", hostname: "stclaircannabis.com" },
      { protocol: "https", hostname: "athena-cannabis-images.vercel.app", pathname: "/products/delivery/v1/**" },
      { protocol: "https", hostname: "pub-eb3e1fe18a43477eabc885cfb791d97c.r2.dev", pathname: "/products/**" },
    ],
  },
  async redirects() {
    const caHosts = ["nativemedicinegarden.ca", "www.nativemedicinegarden.ca"] as const;
    const caToCom = caHosts.flatMap((host) => [
      {
        source: "/",
        has: [{ type: "host" as const, value: host }],
        destination: "https://www.nativemedicinecannabis.com/",
        statusCode: 301,
      },
      {
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://www.nativemedicinecannabis.com/:path*",
        statusCode: 301,
      },
    ]);

    return [
      ...caToCom,
      { source: "/exotic", destination: "/exotic-weed", permanent: true },
      { source: "/premium", destination: "/premium-weed", permanent: true },
      { source: "/aaa", destination: "/aaa-weed", permanent: true },
      { source: "/aa", destination: "/aa-weed", permanent: true },
      { source: "/budget", destination: "/budget-weed", permanent: true },
      { source: "/delivery", destination: "/weed-delivery-toronto", permanent: true },
      { source: "/resources", destination: "/weed-resources", permanent: true },
      { source: "/resources/menu-guide", destination: "/resources/cannabis-menu-guide", permanent: true },
      { source: "/resources/flower-guide", destination: "/resources/weed-flower-guide", permanent: true },
      { source: "/resources/value-guide", destination: "/resources/weed-value-guide", permanent: true },
      { source: "/resources/downtown-bay-street-visit-guide", destination: "/resources/downtown-bay-street-weed-visit-guide", permanent: true },
      {
        source: "/info/york-weed-dispensary",
        destination: "/",
        permanent: true,
      },
      { source: "/info/gerrard-bay-weed-dispensary", destination: "/visit", permanent: true },
      { source: "/info/weed-store-near-downtown-toronto", destination: "/visit", permanent: true },
      { source: "/info/dispensary-near-me-gerrard-bay", destination: "/visit", permanent: true },
      { source: "/info/weed-store-near-toronto", destination: "/visit", permanent: true },
      { source: "/info/weed-store-near-mississauga", destination: "/visit", permanent: true },
      {
        source: "/info/cheap-weed-york",
        destination: "/info/cheap-weed-gerrard-bay",
        permanent: true,
      },
      {
        source: "/info/native-cigarettes-york",
        destination: "/info/native-cigarettes-gerrard-bay",
        permanent: true,
      },
      {
        source: "/info/dispensary-near-me-york",
        destination: "/visit",
        permanent: true,
      },
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:path*", destination: "/", permanent: true },
      { source: "/edibles", destination: "/items/edibles", permanent: true },
      { source: "/vapes", destination: "/items/vapes", permanent: true },
      {
        source: "/vape-disposables",
        destination: "/items/vape-disposables",
        permanent: true,
      },
      {
        source: "/concentrates",
        destination: "/items/concentrates",
        permanent: true,
      },
      { source: "/prerolls", destination: "/items/prerolls", permanent: true },
      { source: "/add-ons", destination: "/items/add-ons", permanent: true },
      {
        source: "/cigarettes",
        destination: "/items/cigarettes",
        permanent: true,
      },
      { source: "/magic", destination: "/items/magic", permanent: true },
    ];
  },
};

export default nextConfig;
