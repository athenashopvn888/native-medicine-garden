export type TierEducation = {
  sections: { heading: string; body: string }[];
  links: { label: string; href: string }[];
};

export const TIER_EDUCATION: Record<string, TierEducation> = {
  EXOTIC: {
    sections: [
      { heading: "What “Exotic Weed” Means on This Menu", body: "Exotic Weed is Native Medicine Garden's highest-positioned flower browsing category. The label helps adults narrow the current menu. It is not a universal Canadian government grade and it should not be treated as a guaranteed THC range." },
      { heading: "What Adults May Compare", body: "Inside the Exotic Weed category, compare the actual product information: producer, cultivar, THC/CBD, package details and any aroma or other product information that is actually provided. Flower appearance, trim, trichomes, cure and freshness can also differ between products." },
      { heading: "Exotic Is Not the Same as One Effect", body: "Exotic can describe premium positioning, distinctive genetics, aroma, rarity or presentation. It does not guarantee one effect or one terpene profile." },
    ],
    links: [
      { label: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide" },
      { label: "Top Shelf, Mids & Quads", href: "/resources/flower-guides/top-shelf-mids-quads" },
      { label: "Gas, Loud & Terpy", href: "/resources/flower-guides/terpenes-gas-loud-aroma" },
      { label: "THC vs Weed Quality", href: "/resources/flower-guides/thc-vs-weed-quality" },
    ],
  },
  PREMIUM: {
    sections: [
      { heading: "What “Premium Weed” Means on This Menu", body: "Premium Weed is a dedicated Native Medicine Garden flower category. It helps adults browse a higher-positioned shelf without pretending that the word Premium is one regulated national grade." },
      { heading: "Compare the Product, Not Only the Category", body: "Use the current listing for producer, cultivar, THC/CBD, package details and current price. The educational guides explain aroma, trichomes, cure, freshness and other quality language that the category name cannot fully describe." },
      { heading: "Premium Is Not Automatically Higher THC", body: "Premium positioning and THC are different pieces of information. A larger THC number does not automatically determine the flower category." },
    ],
    links: [
      { label: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide" },
      { label: "What Does Good Weed Mean?", href: "/resources/flower-guides/what-does-good-weed-mean" },
      { label: "THC vs Weed Quality", href: "/resources/flower-guides/thc-vs-weed-quality" },
      { label: "Drying, Curing & Freshness", href: "/resources/flower-guides/drying-curing-freshness" },
    ],
  },
  "AAA+": {
    sections: [
      { heading: "AAA+ Weed: Useful Retail Shorthand", body: "AAA+ Weed is Native Medicine Garden's established category name. AAA and AAA+ are familiar cannabis retail terms, but they are not one universal government grading system." },
      { heading: "AAA+ vs Quads / AAAA", body: "Quads is common Canadian slang for AAAA and generally signals premium positioning. AAA+ sits in a different retail-label lane. Do not assume a fixed THC threshold separates the terms." },
      { heading: "Read the Current Listing", body: "Use the current product page for the actual producer, cultivar, THC/CBD, package details, price and availability." },
    ],
    links: [
      { label: "Top Shelf, Mids & Quads", href: "/resources/flower-guides/top-shelf-mids-quads" },
      { label: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide" },
      { label: "THC vs Weed Quality", href: "/resources/flower-guides/thc-vs-weed-quality" },
      { label: "Weed Slang Explained", href: "/resources/cannabis-101/weed-slang-glossary" },
    ],
  },
  AA: {
    sections: [
      { heading: "AA Weed as a Clear Menu Category", body: "AA Weed is one of Native Medicine Garden's five flower categories. The label makes the menu easier to scan. It does not define one mandatory THC level, aroma profile or bud size." },
      { heading: "Value and Quality Are Different Questions", body: "AA Weed can be part of a value-first browse. Value does not automatically mean low quality, and a lower price does not prove that flower is weak or stale." },
      { heading: "Compare Current Product Information", body: "Use the current listing for changing price, stock, package and product-specific details." },
    ],
    links: [
      { label: "Weed Value Guide", href: "/resources/weed-value-guide" },
      { label: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide" },
      { label: "What Does Good Weed Mean?", href: "/resources/flower-guides/what-does-good-weed-mean" },
      { label: "Smalls vs Big Buds", href: "/resources/flower-guides/smalls-vs-big-buds" },
    ],
  },
  BUDGET: {
    sections: [
      { heading: "Budget Weed Means Value-First Browsing", body: "Budget Weed is Native Medicine Garden's value-first flower category. The word Budget describes price positioning on the menu. It does not automatically mean unsafe, stale, weak or low THC." },
      { heading: "Do Not Judge the Product From the Label Alone", body: "Adults can still compare producer, cultivar, THC/CBD, package details, aroma information where provided and the actual flower characteristics." },
      { heading: "Current Price Belongs on the Current Page", body: "Prices and deals can change. Use the live category for current pricing, product details and availability." },
    ],
    links: [
      { label: "Weed Value Guide", href: "/resources/weed-value-guide" },
      { label: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide" },
      { label: "THC vs Weed Quality", href: "/resources/flower-guides/thc-vs-weed-quality" },
      { label: "What Does Good Weed Mean?", href: "/resources/flower-guides/what-does-good-weed-mean" },
    ],
  },
};
