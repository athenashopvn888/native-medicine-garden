export interface TierSeoData {
  seoTitle: string;
  seoIntro: string;
  sections: { heading: string; body: string }[];
  faqs: { q: string; a: string }[];
}

export const TIER_SEO: Record<string, TierSeoData> = {
  EXOTIC: {
    seoTitle: "Exotic Cannabis Flower Toronto | Native Medicine Garden",
    seoIntro:
      "Browse top-tier flower category browsing at Native Medicine Garden near Gerrard Street West and Bay Street. Confirm current strains, prices, and availability before visiting.",
    sections: [
      {
        heading: "Exotic Flower At Native Medicine Garden",
        body: "Native Medicine Garden lists Exotic flower as part of its tiered cannabis menu. Use this page for category context, then check the current menu for exact strain availability, THC details, and package pricing.",
      },
      {
        heading: "Pricing Context From $20/g",
        body: "The Exotic tier is presented with clear menu pricing and deal context where available. Prices and stock can change, so confirm the current menu or ask in store before purchase.",
      },
      {
        heading: "Local Store Context",
        body: "Native Medicine Garden is located at 76 Gerrard St W, Toronto, ON M5G 1J5, serving shoppers around Gerrard Street West, Bay Street, Yonge Street, College Park, Toronto Metropolitan University, University Avenue, Downtown Toronto.",
      },
    ],
    faqs: [
      {
        q: "What is Exotic flower?",
        a: "Exotic is one of the flower tiers shown on the Native Medicine Garden menu. It helps shoppers compare category and price context before visiting.",
      },
      {
        q: "Does this page guarantee current Exotic stock?",
        a: "No. Use the current menu or ask in store for exact availability.",
      },
      { q: "Where is the store?", a: "76 Gerrard St W, Toronto, ON M5G 1J5" },
    ],
  },

  PREMIUM: {
    seoTitle: "Premium Cannabis Flower Toronto | Native Medicine Garden",
    seoIntro:
      "Browse premium flower category browsing at Native Medicine Garden near Gerrard Street West and Bay Street. Confirm current strains, prices, and availability before visiting.",
    sections: [
      {
        heading: "Premium Flower At Native Medicine Garden",
        body: "Native Medicine Garden lists Premium flower as part of its tiered cannabis menu. Use this page for category context, then check the current menu for exact strain availability, THC details, and package pricing.",
      },
      {
        heading: "Pricing Context From $15/g",
        body: "The Premium tier is presented with clear menu pricing and deal context where available. Prices and stock can change, so confirm the current menu or ask in store before purchase.",
      },
      {
        heading: "Local Store Context",
        body: "Native Medicine Garden is located at 76 Gerrard St W, Toronto, ON M5G 1J5, serving shoppers around Gerrard Street West, Bay Street, Yonge Street, College Park, Toronto Metropolitan University, University Avenue, Downtown Toronto.",
      },
    ],
    faqs: [
      {
        q: "What is Premium flower?",
        a: "Premium is one of the flower tiers shown on the Native Medicine Garden menu. It helps shoppers compare category and price context before visiting.",
      },
      {
        q: "Does this page guarantee current Premium stock?",
        a: "No. Use the current menu or ask in store for exact availability.",
      },
      { q: "Where is the store?", a: "76 Gerrard St W, Toronto, ON M5G 1J5" },
    ],
  },

  "AAA+": {
    seoTitle: "AAA+ Cannabis Flower Toronto | Native Medicine Garden",
    seoIntro:
      "Browse the AAA+ flower tier at Native Medicine Garden near Gerrard Street West and Bay Street. Check current menu items and prices before visiting.",
    sections: [
      {
        heading: "AAA+ Flower At Native Medicine Garden",
        body: "Native Medicine Garden lists AAA+ flower as part of its tiered cannabis menu. Use this page for category context, then check the current menu for exact strain availability, THC details, and package pricing.",
      },
      {
        heading: "Pricing Context From $10/g",
        body: "The AAA+ tier is presented with clear menu pricing and deal context where available. Prices and stock can change, so confirm the current menu or ask in store before purchase.",
      },
      {
        heading: "Local Store Context",
        body: "Native Medicine Garden is located at 76 Gerrard St W, Toronto, ON M5G 1J5, serving shoppers around Gerrard Street West, Bay Street, Yonge Street, College Park, Toronto Metropolitan University, University Avenue, Downtown Toronto.",
      },
    ],
    faqs: [
      {
        q: "What is AAA+ flower?",
        a: "AAA+ is one of the flower tiers shown on the Native Medicine Garden menu. It helps shoppers compare category and price context before visiting.",
      },
      {
        q: "Does this page guarantee current AAA+ stock?",
        a: "No. Use the current menu or ask in store for exact availability.",
      },
      { q: "Where is the store?", a: "76 Gerrard St W, Toronto, ON M5G 1J5" },
    ],
  },

  AA: {
    seoTitle: "AA Cannabis Flower Toronto | Native Medicine Garden",
    seoIntro:
      "Browse daily-driver flower category browsing at Native Medicine Garden near Gerrard Street West and Bay Street. Confirm current strains, prices, and availability before visiting.",
    sections: [
      {
        heading: "AA Flower At Native Medicine Garden",
        body: "Native Medicine Garden lists AA flower as part of its tiered cannabis menu. Use this page for category context, then check the current menu for exact strain availability, THC details, and package pricing.",
      },
      {
        heading: "Pricing Context From $4/g",
        body: "The AA tier is presented with clear menu pricing and deal context where available. Prices and stock can change, so confirm the current menu or ask in store before purchase.",
      },
      {
        heading: "Local Store Context",
        body: "Native Medicine Garden is located at 76 Gerrard St W, Toronto, ON M5G 1J5, serving shoppers around Gerrard Street West, Bay Street, Yonge Street, College Park, Toronto Metropolitan University, University Avenue, Downtown Toronto.",
      },
    ],
    faqs: [
      {
        q: "What is AA flower?",
        a: "AA is one of the flower tiers shown on the Native Medicine Garden menu. It helps shoppers compare category and price context before visiting.",
      },
      {
        q: "Does this page guarantee current AA stock?",
        a: "No. Use the current menu or ask in store for exact availability.",
      },
      { q: "Where is the store?", a: "76 Gerrard St W, Toronto, ON M5G 1J5" },
    ],
  },

  BUDGET: {
    seoTitle: "Budget Cannabis Toronto | Native Medicine Garden",
    seoIntro:
      "Browse value flower category browsing at Native Medicine Garden near Gerrard Street West and Bay Street. Confirm current strains, prices, and availability before visiting.",
    sections: [
      {
        heading: "Budget Flower At Native Medicine Garden",
        body: "Native Medicine Garden lists Budget flower as part of its tiered cannabis menu. Use this page for category context, then check the current menu for exact strain availability, THC details, and package pricing.",
      },
      {
        heading: "Pricing Context From $3/g",
        body: "The Budget tier is presented with clear menu pricing and deal context where available. Prices and stock can change, so confirm the current menu or ask in store before purchase.",
      },
      {
        heading: "Local Store Context",
        body: "Native Medicine Garden is located at 76 Gerrard St W, Toronto, ON M5G 1J5, serving shoppers around Gerrard Street West, Bay Street, Yonge Street, College Park, Toronto Metropolitan University, University Avenue, Downtown Toronto.",
      },
    ],
    faqs: [
      {
        q: "What is Budget flower?",
        a: "Budget is one of the flower tiers shown on the Native Medicine Garden menu. It helps shoppers compare category and price context before visiting.",
      },
      {
        q: "Does this page guarantee current Budget stock?",
        a: "No. Use the current menu or ask in store for exact availability.",
      },
      { q: "Where is the store?", a: "76 Gerrard St W, Toronto, ON M5G 1J5" },
    ],
  },
};
