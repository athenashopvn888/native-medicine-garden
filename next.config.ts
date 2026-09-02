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
    return [
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
        destination: "/info/gerrard-bay-weed-dispensary",
        permanent: true,
      },
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
        source: "/info/weed-store-near-toronto",
        destination: "/info/weed-store-near-downtown-toronto",
        permanent: true,
      },
      {
        source: "/info/weed-store-near-mississauga",
        destination: "/info/weed-store-near-downtown-toronto",
        permanent: true,
      },
      {
        source: "/info/dispensary-near-me-york",
        destination: "/info/dispensary-near-me-gerrard-bay",
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
