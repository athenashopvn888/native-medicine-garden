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
}

export const RESOURCE_PAGES: ResourcePage[] = [
  {
    slug: "",
    title: "Native Medicine Garden Resources",
    seoTitle: "Native Medicine Garden Resources | Downtown Toronto / Bay Street Menu And Visit Guides",
    description: "Native Medicine Garden resource pages for Downtown Toronto / Bay Street shoppers, with local visit planning, menu shortcuts, flower tier pricing, value shopping, pre-roll tips, and Native smokes prices.",
    eyebrow: "Downtown Toronto Resource Hub",
    intro: "A practical resource hub for downtown Toronto, Bay Street, and Yonge Street shoppers. Use it to find the relevant menu section for flower, pre-rolls, edibles, THC vapes, concentrates, accessories, cigarettes, Native smokes, Backwoods, and grabba.",
    cards: [
      { title: "Weed Visit Guide", href: "/resources/downtown-bay-street-weed-visit-guide", text: "Review the store details already published for a downtown Toronto visit." },
      { title: "Cannabis Menu Guide", href: "/resources/cannabis-menu-guide", text: "Start with flower, pre-rolls, edibles, vapes, or smokes, then compare the categories that interest you." },
      { title: "Weed Flower Guide", href: "/resources/weed-flower-guide", text: "Compare Weed Exotic, Weed Premium, Weed AAA+, Weed AA, and Weed Budget." },
      { title: "Weed Value Guide", href: "/resources/weed-value-guide", text: "Explore the Weed Budget, Weed AA and Weed AAA+ collections." },
      { title: "Native Smokes Prices", href: "/resources/native-smokes", text: "Brand and price notes for cigarettes, Backwoods, grabba, and pouch listings." }
    ],
    sections: [
      {
        heading: "Local Search, Useful Next Step",
        body: "Native Medicine Garden is listed at 76 Gerrard St W, Toronto, ON M5G 1J5. These guides help shoppers plan the visit. Start with the local page for address and visit details, then use these guides to compare categories.",
        bullets: ["Local store page: /weed-dispensary-toronto", "Local areas: Gerrard St W, Bay St, Yonge St, Eaton Centre, Dundas Station, College Street, and TTC routes", "Listed store hours: Open 24 Hours"]
      },
      {
        heading: "Built Around Real Menu Choices",
        body: "The guides stay focused on real visits: weed dispensary near Downtown Toronto / Bay Street, cannabis store Toronto, cheap weed, budget weed, pre-rolls, edibles, THC vapes, concentrates, Native cigarettes, Backwoods, and grabba."
      }
    ],
  },
  {
    slug: "downtown-bay-street-weed-visit-guide",
    title: "Weed Guide for Downtown Bay Street",
    seoTitle: "Downtown Toronto And Bay Street Weed Dispensary Visit Guide | Native Medicine Garden",
    description: "Local visit planning for Native Medicine Garden at 76 Gerrard St W, with Gerrard St W, Bay St, Yonge St, Eaton Centre, Dundas Station, College Street, and TTC routes context, menu shortcuts, hours, and category guides.",
    eyebrow: "Visit Guide",
    intro: "Use this page when the search starts local: weed dispensary near Downtown Toronto / Bay Street, cannabis store near 76 Gerrard St W, or a quick menu check before visiting from Gerrard St W, Bay St, Yonge St, Eaton Centre, Dundas Station, College Street, and TTC routes.",
    cards: [
      { title: "Local Store Page", href: "/weed-dispensary-toronto", text: "Use the local store page for address, directions, hours, and contact details." },
      { title: "Cannabis Menu Guide", href: "/resources/cannabis-menu-guide", text: "Choose the product category before opening the menu." },
      { title: "Weed Value Guide", href: "/resources/weed-value-guide", text: "Explore value-oriented Weed flower collections." }
    ],
    sections: [
      {
        heading: "Address Anchor",
        body: "Native Medicine Garden is listed at 76 Gerrard St W, Toronto, ON M5G 1J5. Keep that address as the local anchor, then use the resource pages to decide whether the trip is about flower, pre-rolls, edibles, THC vapes, concentrates, accessories, or cigarettes."
      },
      {
        heading: "Neighborhood Search Areas",
        body: "Downtown shoppers move fast between Bay, Yonge, Gerrard, Eaton Centre, Dundas Station, and College Street, so these resources are built for quick decisions and clear category links.",
        bullets: ["Gerrard St W cannabis store local search", "Bay St cannabis store local search", "Yonge St cannabis store local search", "Eaton Centre cannabis store local search", "Dundas Station cannabis store local search", "TTC cannabis store local search", "College Street cannabis store local search"]
      },
      {
        heading: "Best First Click",
        body: "If you need store details, start with /weed-dispensary-toronto. If you are comparing product types, start with the menu guide. If the trip is about Native smokes or cigarettes, start with the Native smokes page and then confirm the current category page."
      }
    ],
  },
  {
    slug: "cannabis-menu-guide",
    title: "Cannabis Menu Guide",
    seoTitle: "Native Medicine Garden Menu Guide | Flower, Pre-Rolls, Edibles, Vapes And Cigarettes",
    description: "A practical menu guide for Native Medicine Garden, covering flower tiers, pre-rolls, edibles, THC vapes, concentrates, accessories, cigarettes, and Native smokes.",
    eyebrow: "Menu Guide",
    intro: "The menu gets easier when you choose the category first. Flower has tier math. Pre-rolls have format details. Edibles, THC vapes, concentrates, and accessories each have different details to compare. Cigarettes need brand and price checks.",
    cards: [
      { title: "Weed Flower Collections", href: "/resources/weed-flower-guide", text: "Start here for Weed Exotic, Weed Premium, Weed AAA+, Weed AA, and Weed Budget." },
      { title: "Pre-Rolls", href: "/resources/pre-roll-guide", text: "Use this for ready-to-smoke singles, packs, and quick-trip browsing." },
      { title: "Cigarettes", href: "/items/cigarettes", text: "Open the cigarette category for current Native smokes listings." },
      { title: "Local Store Page", href: "/weed-dispensary-toronto", text: "Return to the local store page." }
    ],
    sections: [
      {
        heading: "Pick The Shelf First",
        body: "For downtown Toronto, Bay Street, and Yonge Street shoppers, the best first step is simple: flower shoppers compare tiers, pre-roll shoppers compare format, edible and vape shoppers compare current item details, and cigarette shoppers compare brand, full/light/menthol style, and price.",
        bullets: ["Flower, pre-rolls, edibles, THC vapes, concentrates, accessories, and cigarettes are easier to compare one category at a time.", "Use current category pages for today's details.", "Use these guides for visit planning."]
      },
      {
        heading: "Local Shopping Cues",
        body: "This page helps shoppers searching for weed dispensary near Downtown Toronto / Bay Street, cannabis store Toronto, cheap weed near me, Native cigarettes, and THC vape menu while keeping the actual shopping step clear."
      }
    ],
  },
  {
    slug: "weed-flower-guide",
    title: "Weed & Cannabis Flower Guide",
    seoTitle: "Native Medicine Garden Flower Tier Guide | Exotic, Premium, AAA+, AA And Budget",
    description: "Compare Native Medicine Garden flower tiers with posted per-gram prices, 3g specials, 6g deal math, Budget flower, AA flower, AAA+, Premium, and Exotic.",
    eyebrow: "Flower Tiers",
    intro: "Here is the clean flower read: Exotic is posted at $20/g, Premium at $15/g, AAA+ at $10/g, AA at $4/g, and Budget at $3/g. Where the 6g tier deal applies, shoppers can compare Exotic around $60 for 6g, Premium around $45 for 6g, and AAA+ around $30 for 6g.",
    cards: [
      { title: "Weed Exotic", href: "/exotic-weed", text: "Explore the Weed Exotic collection." },
      { title: "Weed Premium", href: "/premium-weed", text: "Browse the Weed Premium collection." },
      { title: "Weed AAA+", href: "/aaa-weed", text: "Explore the Weed AAA+ collection." },
      { title: "Weed AA", href: "/aa-weed", text: "Browse the Weed AA collection." },
      { title: "Weed Budget", href: "/budget-weed", text: "Explore the Weed Budget collection." }
    ],
    sections: [
      {
        heading: "Why The 6g Line Matters",
        body: "A straight per-gram price does not always tell the whole shelf story. The top flower lanes can show 3g and 6g deal logic, so a shopper comparing Exotic, Premium, and AAA+ should read the bundle line before judging value.",
        bullets: ["Exotic: $20/g, 3g for $40 or 6g around $60 where listed.", "Premium: $15/g, 3g for $30 or 6g around $45 where listed.", "AAA+: $10/g, 3g for $20 or 6g around $30 where listed."]
      },
      {
        heading: "Budget And AA Keep It Simple",
        body: "For cheap weed and budget weed searches, Budget at $3/g and AA at $4/g are the simplest lanes to compare. Check the current tier page for listed product names, prices, and item notes."
      }
    ],
  },
  {
    slug: "weed-value-guide",
    title: "Native Medicine Garden Value Weed Guide",
    seoTitle: "Native Medicine Garden Value Weed Guide | Cheap Weed Near Downtown Toronto / Bay Street",
    description: "A value shopping guide for Native Medicine Garden, covering cheap weed, budget weed, AA flower, AAA+ deals, 6g tier math, and affordable menu choices.",
    eyebrow: "Value Guide",
    intro: "For downtown Toronto value shopping, value shopping works best when the shelf is clear. Start with Budget, AA, and AAA+ before jumping into higher tiers or mixed categories.",
    cards: [
      { title: "Weed Budget", href: "/budget-weed", text: "Explore the Weed Budget collection." },
      { title: "Weed AA", href: "/aa-weed", text: "Browse the Weed AA collection." },
      { title: "Weed AAA+", href: "/aaa-weed", text: "Explore the Weed AAA+ collection." },
      { title: "Native Smokes Prices", href: "/resources/native-smokes", text: "Use this if cigarettes or Backwoods are part of the same stop." }
    ],
    sections: [
      {
        heading: "Start With Budget, Then Move Up",
        body: "If the search is cheap weed, budget weed, or affordable cannabis near Downtown Toronto / Bay Street, start with Budget and AA. If the trip can stretch a little, AAA+ gives shoppers another value lane with 3g and 6g deal logic."
      },
      {
        heading: "Compare Inside The Category",
        body: "Value looks different across flower, pre-rolls, edibles, THC vapes, concentrates, accessories, and cigarettes. Compare one product type at a time so the choice stays clear."
      }
    ],
  },
  {
    slug: "pre-roll-guide",
    title: "Native Medicine Garden Pre-Roll And Quick Trip Guide",
    seoTitle: "Native Medicine Garden Pre-Roll Guide | Ready-To-Smoke Menu Tips",
    description: "A pre-roll guide for Native Medicine Garden, with quick-trip tips for ready-to-smoke options, flower cross-shopping, edibles, vapes, concentrates, and accessories.",
    eyebrow: "Pre-Roll Guide",
    intro: "Pre-roll shoppers usually want a faster path than loose flower shoppers. Use this page when the goal is ready-to-smoke options, a quick stop, or a small add-on beside another category.",
    cards: [
      { title: "Pre-Rolls", href: "/items/prerolls", text: "Open the current pre-roll category." },
      { title: "Weed Flower Collections", href: "/resources/weed-flower-guide", text: "Switch here if the visit turns into loose flower." },
      { title: "Cannabis Menu Guide", href: "/resources/cannabis-menu-guide", text: "Use this if the stop includes edibles, vapes, concentrates, or accessories." }
    ],
    sections: [
      {
        heading: "Keep Pre-Rolls In Their Own Lane",
        body: "Pre-rolls should be compared by format, pack size, posted details, and current price. Do not force loose-flower tier logic onto pre-roll shopping unless the visit actually changes categories."
      },
      {
        heading: "Useful For Local Quick Stops",
        body: "For downtown Toronto, Bay Street, and Yonge Street shoppers, pre-rolls offer a direct category to check before heading through Gerrard St W, Bay St, Yonge St, Eaton Centre, Dundas Station, College Street, and TTC routes. Use the current category page for current details."
      }
    ],
  },
  {
    slug: "native-smokes",
    title: "Native Medicine Garden Native Smokes Price Guide",
    seoTitle: "Native Medicine Garden Native Smokes Prices | Cigarettes, Backwoods And Grabba",
    description: "Native Medicine Garden Native smokes resource with cigarette brands and listed prices for Canadian, Putters, Canadian Goose, Nexus, Time, Backwoods, grabba, pouches, and mixed smoke items where shown.",
    eyebrow: "Native Smokes",
    intro: "This page gives cigarette shoppers a real starting point instead of a vague category page. Use it for Native cigarettes, Canadian brands, Backwoods, grabba, nicotine pouches, and mixed smoke item price checks at Native Medicine Garden.",
    cards: [
      { title: "$25 Cigarette Brands", href: "/items/cigarettes", text: "The cigarette category lists CANADIAN LIGHTS, CANADIAN FULL, PUTTERS, CANADIAN GOOSE FULL, CANADIAN GOOSE LIGHTS, CANADIAN MENTHOL, CANADIAN CLASSICS ORIGINAL, CANADIAN CLASSICS SILVER, ROLLED GOLD LIGHTS, NEXUS FULL, NEXUS LIGHTS, TIME FULL at $25 where shown." },
      { title: "Backwoods And Grabba", href: "/items/cigarettes", text: "NICOTINE POUCHES , VELO, PABLO, KILLA at $20; GRABBA at $5; GRABBA SHAKER *RedRose / Red Herring* at $19; BACKWOODS ASSORTED FLAVORS $20-$25 at $20; NEW BACKWOODS FLAVORS at $25; 10 X PREMIUM MIX CIGARETTES at $3" },
      { title: "Native Cigarettes Guide", href: "/resources/native-smokes/native-cigarettes-guide", text: "A fuller brand and price breakdown for cigarette shoppers." }
    ],
    sections: [
      {
        heading: "$25 Cigarette Brand List",
        body: "The cigarette category lists CANADIAN LIGHTS, CANADIAN FULL, PUTTERS, CANADIAN GOOSE FULL, CANADIAN GOOSE LIGHTS, CANADIAN MENTHOL, CANADIAN CLASSICS ORIGINAL, CANADIAN CLASSICS SILVER, ROLLED GOLD LIGHTS, NEXUS FULL, NEXUS LIGHTS, TIME FULL at $25 where shown.",
        bullets: ["CANADIAN LIGHTS - $25", "CANADIAN FULL - $25", "PUTTERS - $25", "CANADIAN GOOSE FULL - $25", "CANADIAN GOOSE LIGHTS - $25", "CANADIAN MENTHOL - $25", "CANADIAN CLASSICS ORIGINAL - $25", "CANADIAN CLASSICS SILVER - $25", "ROLLED GOLD LIGHTS - $25", "NEXUS FULL - $25", "NEXUS LIGHTS - $25", "TIME FULL - $25"]
      },
      {
        heading: "Backwoods, Grabba, Pouches, And Mix Items",
        body: "NICOTINE POUCHES , VELO, PABLO, KILLA at $20; GRABBA at $5; GRABBA SHAKER *RedRose / Red Herring* at $19; BACKWOODS ASSORTED FLAVORS $20-$25 at $20; NEW BACKWOODS FLAVORS at $25; 10 X PREMIUM MIX CIGARETTES at $3"
      },
      {
        heading: "Confirm The Current Shelf",
        body: "Cigarette inventory, flavors, and brand mix can change. Use the cigarette category for the current public list, then confirm in store when one exact brand, full/light/menthol style, pouch, grabba, or Backwoods flavor matters."
      }
    ],
  },
  {
    slug: "native-smokes/native-cigarettes-guide",
    title: "Native Medicine Garden Native Cigarettes Brand Guide",
    seoTitle: "Native Medicine Garden Native Cigarettes Guide | Brand And Price List",
    description: "A detailed Native cigarettes brand guide for Native Medicine Garden, including $25 cigarette listings and smoke add-on prices where shown.",
    eyebrow: "Native Cigarettes",
    intro: "If the trip includes cigarettes, start with brand and price first. This guide keeps Native cigarettes, Backwoods, grabba, pouches, and mixed smoke items separate from flower, pre-rolls, edibles, THC vapes, and concentrates.",
    cards: [
      { title: "Cigarette Category", href: "/items/cigarettes", text: "Open the current cigarette category." },
      { title: "Native Smokes Overview", href: "/resources/native-smokes", text: "Return to the shorter price guide." },
      { title: "Weed Visit Guide", href: "/resources/downtown-bay-street-weed-visit-guide", text: "Plan the store stop using the published local details." }
    ],
    sections: [
      {
        heading: "Brand Names To Check",
        body: "The cigarette category lists CANADIAN LIGHTS, CANADIAN FULL, PUTTERS, CANADIAN GOOSE FULL, CANADIAN GOOSE LIGHTS, CANADIAN MENTHOL, CANADIAN CLASSICS ORIGINAL, CANADIAN CLASSICS SILVER, ROLLED GOLD LIGHTS, NEXUS FULL, NEXUS LIGHTS, TIME FULL at $25 where shown.",
        bullets: ["CANADIAN LIGHTS - $25", "CANADIAN FULL - $25", "PUTTERS - $25", "CANADIAN GOOSE FULL - $25", "CANADIAN GOOSE LIGHTS - $25", "CANADIAN MENTHOL - $25", "CANADIAN CLASSICS ORIGINAL - $25", "CANADIAN CLASSICS SILVER - $25", "ROLLED GOLD LIGHTS - $25", "NEXUS FULL - $25", "NEXUS LIGHTS - $25", "TIME FULL - $25"]
      },
      {
        heading: "Smoke Category Add-Ons",
        body: "NICOTINE POUCHES , VELO, PABLO, KILLA at $20; GRABBA at $5; GRABBA SHAKER *RedRose / Red Herring* at $19; BACKWOODS ASSORTED FLAVORS $20-$25 at $20; NEW BACKWOODS FLAVORS at $25; 10 X PREMIUM MIX CIGARETTES at $3"
      },
      {
        heading: "Separate The Smoke Shelf From Cannabis Shopping",
        body: "When the same visit includes flower, pre-rolls, edibles, THC vapes, concentrates, or accessories, keep cigarettes as their own lane. It makes the category easier for both cannabis shoppers and Native smokes shoppers."
      }
    ],
  },
  {
    slug: "resource-centre-launch",
    title: "Native Medicine Garden Resource Centre",
    seoTitle: "Native Medicine Garden Resource Centre | Local Menu Guides",
    description: "Native Medicine Garden resource centre with local visit planning, menu guides, flower tier pricing, value shopping, pre-roll tips, and Native smokes prices.",
    eyebrow: "Resource Update",
    intro: "Use this page for local visit planning, menu guides, flower tier pricing, value shopping, pre-roll tips, and cigarette price notes.",
    cards: [
      { title: "Weed Resource Home", href: "/weed-resources", text: "Start at the Weed resource hub." },
      { title: "Weed Visit Guide", href: "/resources/downtown-bay-street-weed-visit-guide", text: "Review the published store details for a downtown Toronto visit." },
      { title: "Weed Flower Guide", href: "/resources/weed-flower-guide", text: "Compare the five Weed flower collections." },
      { title: "Native Smokes Prices", href: "/resources/native-smokes", text: "Check brand and price notes." }
    ],
    sections: [
      {
        heading: "What Changed",
        body: "The resource pages keep local shoppers oriented with visit planning, category guides, and quick links back to the menu."
      },
      {
        heading: "What Stayed Protected",
        body: "The main guides connect shoppers with the broader Toronto Weed selection, five Weed flower collections, the Cannabis menu guide, pre-roll information and separate Native smokes resources."
      }
    ],
  }
];

export const RESOURCE_HOME = RESOURCE_PAGES[0];

export function getResourcePage(slug: string) {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return RESOURCE_PAGES.find((page) => page.slug === cleanSlug);
}
