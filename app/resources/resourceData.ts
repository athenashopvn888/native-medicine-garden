import knowledgeData from "./knowledgeData.json";

export interface ResourceCard {
  title: string;
  href: string;
  text: string;
}

export interface ResourceSection {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface ResourcePage {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  intro: string;
  cards: ResourceCard[];
  sections: ResourceSection[];
  lead?: string[];
  blocks?: {
    level: number;
    heading: string;
    paragraphs: string[];
    bullets: string[];
    ordered: string[];
  }[];
  faqs?: { question: string; answer: string }[];
  schemaType?: "Article" | "WebPage" | "CollectionPage";
}

const SUPPORTING_PAGES: ResourcePage[] = [
  {
    slug: "cannabis-menu-guide",
    title: "Cannabis Menu Guide: Pick the Product Category First",
    seoTitle: "Native Medicine Garden Cannabis Menu Guide | Downtown Toronto",
    description: "Use this practical guide to choose a Native Medicine Garden menu category first, then open the current product surface for changing details.",
    eyebrow: "Menu Guide",
    intro: "The menu gets easier when you choose the product category first. Educational guides explain stable concepts; current product names, prices, package formats and availability belong on current category and product pages.",
    cards: [
      { title: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide", text: "Learn what the five protected Weed categories can and cannot tell you." },
      { title: "Weed Value Guide", href: "/resources/weed-value-guide", text: "Compare value-first flower using the current listing." },
      { title: "What Does Good Weed Mean?", href: "/resources/flower-guides/what-does-good-weed-mean", text: "Compare aroma, cure, trichomes, freshness and preference." },
      { title: "Pre-Roll Guide", href: "/resources/pre-roll-guide", text: "Keep prepared pre-rolls in their own product-format lane." },
      { title: "Cannabis 101", href: "/resources/cannabis-101", text: "Learn the basics of the main cannabis product categories." },
      { title: "Native Smokes Guide", href: "/resources/native-smokes", text: "Understand commercial-cigarette terminology without freezing current retail details." },
      { title: "Native Cigarettes in Ontario", href: "/resources/native-smokes/native-cigarettes-guide", text: "Read the deeper Ontario terminology guide." },
    ],
    sections: [
      { heading: "Flower", body: "Flower is easiest to browse through the five protected Weed categories. Open the current category for changing product details." },
      { heading: "Pre-Rolls", body: "Pre-rolls belong in their own product-format lane. Read the current listing for pack count, total weight, format, price and availability." },
      { heading: "Edibles, THC Vapes and Concentrates", body: "Keep these as separate product types and use current product surfaces for changing details." },
      { heading: "Cigarettes / Native Smokes", body: "Commercial cigarettes belong in their own category. Use the current cigarette surface for changing retail details and the Native Smokes guides for terminology and Ontario context." },
      { heading: "Current Details Belong on Current Pages", body: "Educational guides explain how to read the menu. Current product names, prices, package formats and availability belong on the current category/product pages." },
    ],
    schemaType: "WebPage",
  },
  {
    slug: "pre-roll-guide",
    title: "Native Medicine Garden Pre-Roll Guide",
    seoTitle: "Pre-Roll Guide | Native Medicine Garden Downtown Toronto",
    description: "A practical Native Medicine Garden pre-roll guide covering format, pack size, current product details and when to switch to loose flower education.",
    eyebrow: "Pre-Roll Guide",
    intro: "Pre-rolls should be compared by format, pack size and the current product information rather than by loose-flower tier language.",
    cards: [
      { title: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide", text: "Switch here when the question becomes a loose-flower question." },
      { title: "Cannabis 101", href: "/resources/cannabis-101", text: "Review the main cannabis product formats." },
      { title: "First Visit Guide", href: "/resources/downtown-bay-street-weed-visit-guide", text: "Plan a downtown Toronto visit." },
    ],
    sections: [
      { heading: "Keep Pre-Rolls in Their Own Lane", body: "Pre-rolls should be compared by format, pack size, posted details and current price. Do not force loose-flower tier logic onto pre-roll shopping unless the visit actually changes categories." },
      { heading: "Read the Current Listing", body: "Use current product pages for current pack count, total weight, infused or non-infused details when listed, current price and current availability." },
      { heading: "When the Question Becomes a Flower Question", body: "If the visit shifts from prepared pre-rolls to loose flower, use the Weed & Flower Quality Guide rather than forcing loose-flower tier language onto the pre-roll category." },
    ],
    schemaType: "WebPage",
  },
  {
    slug: "resource-centre-launch",
    title: "Native Medicine Garden Resource Centre",
    seoTitle: "Native Medicine Garden Resource Centre | Weed & Cannabis Guides",
    description: "Start with Native Medicine Garden's Weed & Cannabis Resources for downtown visit guidance, Cannabis 101, flower education and Native-smokes information.",
    eyebrow: "Resource Centre",
    intro: "Native Medicine Garden's resource centre groups useful evergreen guides without replacing the current menu.",
    cards: [{ title: "Weed & Cannabis Resources", href: "/weed-resources", text: "Start at the primary educational hub." }],
    sections: [
      { heading: "Start With the Weed & Cannabis Resource Hub", body: "Native Medicine Garden's resource centre now groups the most useful evergreen guides in one place. Start with the Weed & Cannabis Resources hub for downtown Toronto visit information, Cannabis 101, flower-quality education, Weed slang and Native-smokes terminology." },
      { heading: "Current Menu Details Stay Current", body: "These resources explain stable concepts. Current product names, prices, package formats and availability remain on current menu and product pages." },
    ],
    schemaType: "WebPage",
  },
];

export const RESOURCE_HOME: ResourcePage = {
  slug: "",
  title: "Weed & Cannabis Resources",
  seoTitle: "Native Medicine Garden Weed Resources | Toronto Cannabis Guides",
  description: "Explore Native Medicine Garden Weed resources for Cannabis 101, downtown visit planning, flower quality, Weed slang, value browsing and Native-smokes education.",
  eyebrow: "Native Medicine Garden Education",
  intro: "Use these resource pages for stable explanations and visit planning. Use the current Native Medicine Garden category and product pages for changing product names, prices, package formats and availability.",
  cards: [
    { title: "First Visit to Native Medicine Garden", href: "/resources/downtown-bay-street-weed-visit-guide", text: "Plan a downtown Toronto / Bay Street visit, learn what adults 19+ can expect and choose the right menu lane before arriving." },
    { title: "Cannabis 101", href: "/resources/cannabis-101", text: "Learn the basics of flower, pre-rolls, edibles, THC vapes, Weed tiers, THC, genetics and everyday cannabis language." },
    { title: "Cannabis vs Weed Dispensary", href: "/resources/cannabis-dispensary-vs-weed-dispensary", text: "Understand why adults use cannabis dispensary, weed dispensary, cannabis store and dispensary near me for closely related local searches." },
    { title: "Weed & Flower Quality Guide", href: "/resources/weed-flower-guide", text: "Start with the five Native Medicine Garden Weed categories, then learn what quality language can and cannot tell you." },
    { title: "What Does Good Weed Mean?", href: "/resources/flower-guides/what-does-good-weed-mean", text: "Compare aroma, cure, trichomes, freshness, structure and preference." },
    { title: "Top Shelf, Mids & Quads", href: "/resources/flower-guides/top-shelf-mids-quads", text: "Decode common Weed grade language." },
    { title: "THC vs Weed Quality", href: "/resources/flower-guides/thc-vs-weed-quality", text: "Understand why THC is not a complete flower-quality score." },
    { title: "Bag Appeal", href: "/resources/flower-guides/bag-appeal", text: "Learn what visual first impressions can and cannot show." },
    { title: "Frosty Weed & Trichomes", href: "/resources/flower-guides/trichomes-frosty-weed", text: "Understand the crystals adults notice on cannabis flower." },
    { title: "Gas, Loud & Terpy", href: "/resources/flower-guides/terpenes-gas-loud-aroma", text: "Translate common cannabis aroma language." },
    { title: "Drying, Curing & Freshness", href: "/resources/flower-guides/drying-curing-freshness", text: "Learn what happens to flower after harvest." },
    { title: "Smalls vs Big Buds", href: "/resources/flower-guides/smalls-vs-big-buds", text: "Understand what bud size can and cannot tell you." },
    { title: "BC Grown / Indoor / Hydro / Outdoor", href: "/resources/flower-guides/bc-grown-indoor-hydro-outdoor", text: "Separate origin, environment and cultivation method." },
    { title: "Craft vs Commercial Cannabis", href: "/resources/flower-guides/craft-vs-commercial-cannabis", text: "Compare production scale without treating it as a grade." },
    { title: "Indica vs Sativa vs Hybrid", href: "/resources/cannabis-101/indica-sativa-hybrid", text: "Use familiar labels without turning them into effect guarantees." },
    { title: "Strain vs Cultivar", href: "/resources/cannabis-101/strain-vs-cultivar", text: "Understand why a familiar name still needs context." },
    { title: "Landrace vs Hybrid", href: "/resources/cannabis-101/landrace-vs-hybrid", text: "Read a simple guide to cannabis genetics." },
    { title: "Weed Slang Explained", href: "/resources/cannabis-101/weed-slang-glossary", text: "Translate gas, loud, fire, dank, mids, quads and more." },
    { title: "Cannabis Menu Guide", href: "/resources/cannabis-menu-guide", text: "Pick the product category first." },
    { title: "Weed Value Guide", href: "/resources/weed-value-guide", text: "Compare the category, then the current listing." },
    { title: "Pre-Roll Guide", href: "/resources/pre-roll-guide", text: "Keep prepared pre-rolls in their own product-format lane." },
    { title: "Native Smokes Guide", href: "/resources/native-smokes", text: "Read commercial-cigarette terminology without the guesswork." },
    { title: "Native Cigarettes in Ontario", href: "/resources/native-smokes/native-cigarettes-guide", text: "Understand terms, brands and legal context." },
  ],
  sections: [
    { heading: "Current Menu vs Evergreen Guides", body: "Use these resource pages for stable explanations and visit planning. Use the current Native Medicine Garden category and product pages for changing product names, prices, package formats and availability." },
    { heading: "Native Medicine Garden in Downtown Toronto", body: "Native Medicine Garden is at 76 Gerrard St W, Toronto, ON M5G 1J5. The local store page remains the source for current visit details. The resource hub helps adults understand the menu and the language around it." },
  ],
  schemaType: "CollectionPage",
};

const PACKET_PAGES = knowledgeData as unknown as ResourcePage[];
export const RESOURCE_PAGES: ResourcePage[] = [RESOURCE_HOME, ...PACKET_PAGES, ...SUPPORTING_PAGES];

export function getResourcePage(slug: string) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return RESOURCE_PAGES.find((page) => page.slug === cleanSlug);
}
