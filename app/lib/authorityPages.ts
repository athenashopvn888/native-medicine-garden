export type AuthorityPage = {
  path: string;
  eyebrow: string;
  h1: string;
  summary: string;
  body: string[];
  menuHref: string;
  menuLabel: string;
  faqs: { q: string; a: string }[];
};

export const AUTHORITY_PAGES = {
  geo: {
    path: "/weed-dispensary-gerrard-bay",
    eyebrow: "Downtown Toronto walk-in · Gerrard & Bay",
    h1: "Weed Dispensary at Gerrard & Bay",
    summary: "Plan a walk-in visit to Native Medicine Garden at Gerrard Street West and Bay Street in Downtown Toronto.",
    body: [
      "Native Medicine Garden is at 76 Gerrard St W, just west of Bay Street. From College–Bay, walk north on Bay to Gerrard Street West; College Station, Dundas Station, College Park and Toronto Metropolitan University are all on the surrounding downtown blocks.",
      "Use the live flower tiers and category pages to browse before leaving. The menu separates Exotic, Premium, AAA+, AA and Budget flower from edibles, pre-rolls, THC vapes, nicotine vapes, concentrates, cigarettes and accessories, so each shelf stays clear.",
      "For a visit by car, read the posted curb signs on Gerrard and Bay or use a nearby garage. Street rules vary by block and hour. The visit page has the full TTC, walking and parking notes for the Gerrard & Bay corridor.",
    ],
    menuHref: "/exotic-weed",
    menuLabel: "Browse flower tiers",
    faqs: [
      { q: "Where is Native Medicine Garden?", a: "The store is at 76 Gerrard St W, Toronto, ON M5G 1J5, near Gerrard Street West and Bay Street." },
      { q: "Which subway stations are nearby?", a: "College Station and Dundas Station are the closest Line 1 stops; use the visit page for walking directions." },
    ],
  },
  hours: {
    path: "/24-hour-gerrard-bay-dispensary",
    eyebrow: "Open 24 hours · Seven days a week",
    h1: "Open 24 Hours at Gerrard & Bay",
    summary: "Native Medicine Garden lists round-the-clock walk-in hours at 76 Gerrard St W in Downtown Toronto.",
    body: [
      "The Gerrard Street West counter is open 24 hours a day, seven days a week. That makes the store available before an early downtown shift, after a late TTC ride, or whenever a Gerrard & Bay stop fits your schedule.",
      "The same adult entry rules apply at every hour. Bring government-issued photo ID showing you are 19 or older, and check the current menu before travelling for one specific item because shelves can change throughout the day.",
      "College and Dundas stations connect the corridor to Line 1. Late-night visitors arriving by car should check the posted street signs rather than assume a curb space is available.",
    ],
    menuHref: "/visit",
    menuLabel: "Plan a late-night visit",
    faqs: [
      { q: "Is Native Medicine Garden open 24 hours?", a: "Yes. The live Google Business Profile lists Native Medicine Garden as open 24 hours." },
      { q: "Is ID required overnight?", a: "Yes. Adults 19+ need government-issued photo ID at every hour." },
    ],
  },
  cigarettes: {
    path: "/native-cigarettes-gerrard-bay",
    eyebrow: "Adult cigarette shelf · Gerrard & Bay",
    h1: "Native Cigarettes at Gerrard & Bay",
    summary: "Check Native cigarette packs, cartons and related smoke-shelf listings before visiting Native Medicine Garden downtown.",
    body: [
      "The cigarette category is a separate adult product shelf at the Gerrard & Bay counter. Use the live category page to compare the names and formats currently displayed instead of relying on an older search result or a product mentioned elsewhere.",
      "Pack and carton listings can rotate, so the category page is the practical check before a downtown trip. Read the complete product name and listed format, then ask staff if one exact listing determines your visit.",
      "Native cigarettes is used here only as a merchandise category. This page makes no cultural, heritage, health or reduced-risk claim. Adults 19+ must bring government-issued photo ID.",
    ],
    menuHref: "/items/cigarettes",
    menuLabel: "Check cigarette category",
    faqs: [
      { q: "Where can I check current cigarette listings?", a: "Use the live cigarette category before visiting because packs and cartons can change." },
      { q: "What ID is required?", a: "Adults 19+ need government-issued photo ID at the counter." },
    ],
  },
  nicotine: {
    path: "/nicotine-vape-gerrard-bay",
    eyebrow: "Nicotine vape shelf · Gerrard & Bay",
    h1: "Nicotine Vapes at Gerrard & Bay",
    summary: "Browse the current nicotine vape, pod and pouch category for Native Medicine Garden near Gerrard Street West and Bay Street.",
    body: [
      "Nicotine devices belong on a different shelf from THC and cannabis vapes. Start with the nicotine category, then read the complete device or pod name and format shown on the current listing before visiting the Downtown Toronto counter.",
      "Formats and flavours can rotate. The live category is the source for what is displayed now, while this corridor page helps shoppers reach the right shelf without crossing into the separate THC Vape category.",
      "Nicotine is addictive. This page does not make health, cessation or performance claims. Adults 19+ must bring government-issued photo ID for an in-store purchase.",
    ],
    menuHref: "/items/vapes",
    menuLabel: "Browse nicotine vapes",
    faqs: [
      { q: "Does this page include THC vapes?", a: "No. Nicotine vapes are kept separate from cannabis and THC vape products." },
      { q: "Where can I check current nicotine listings?", a: "Use the live nicotine vape category before visiting because listings can change." },
    ],
  },
} satisfies Record<string, AuthorityPage>;
