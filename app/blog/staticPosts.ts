export interface StaticBlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  seo_title: string;
  metaDescription: string;
  meta_description: string;
  h1: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  content: string;
  faq: string;
  internal_links_used: string;
  relatedLinks: Array<{
    title: string;
    url: string;
    description: string;
  }>;
}

export const STORE_BLOG_CONFIG = {
  storeCode: "NMG01",
  storeName: "Native Medicine Garden",
  city: "Toronto",
  domain: "nativemedicinecannabis.com",
  storePath: "/weed-dispensary-toronto",
};

export const STATIC_POSTS: StaticBlogPost[] = [
  {
    slug: "native-medicine-garden-toronto-store-guide",
    title: "Native Medicine Garden Local Store Guide for Adults 19+",
    seoTitle: "Native Medicine Garden Guide | Toronto Adult 19+",
    seo_title: "Native Medicine Garden Guide | Toronto Adult 19+",
    metaDescription: "Adult 19+ guide to Native Medicine Garden around Downtown Toronto / Bay Street, with local store-page checks, menu-category context, and safe visit planning.",
    meta_description: "Adult 19+ guide to Native Medicine Garden around Downtown Toronto / Bay Street, with local store-page checks, menu-category context, and safe visit planning.",
    h1: "Native Medicine Garden Local Store Guide for Adults 19+",
    excerpt: "Native Medicine Garden guide for adults 19+ reviewing store information around Downtown Toronto / Bay Street.",
    author: "Athena SEO Team",
    date: "2026-07-02",
    category: "Store Guide",
    readTime: "4 min",
    content: `## Native Medicine Garden Local Store Guide for Adults 19+

Native Medicine Garden serves adults 19+ looking for store information around Downtown Toronto / Bay Street. This guide helps visitors understand what to check on the official store page before visiting and how to read menu-category language safely.

The article does not change business facts, publish item-level details, or make personal-use claims. It is a store-specific guide that points readers back to the official store page.

## Why Local Context Helps

Native Medicine Garden is tied to Gerrard St W and Bay St context in Toronto. Local content should make the page easier to understand without changing the store name, location facts, hours, map details, or license information.

Searchers often want to confirm that they are looking at the right storefront before they visit. A concise guide can support that decision by explaining the local context and the safest next steps.

## What To Review Before Visiting

Start with the official Native Medicine Garden store page. Useful checks include the store identity, the local landing page, general menu-category navigation, and any current store notes already shown on the site.

This guide should not be treated as the source for details that may change. If a visitor needs a specific answer before leaving, the official store page or direct store contact is the safer source.

## Menu Categories Are Navigation

Broad category labels help visitors understand how a store page is organized. They are navigation labels, not promises about a specific item at the moment someone reads this article.

That distinction keeps the guide accurate over time. It also keeps the content useful for adults 19+ who need general orientation before reviewing the store page.

## Adult 19+ Visit Basics

Adults 19+ should bring valid government identification and review the official store page before visiting. The article avoids personal-use advice, rating claims, competitor comparisons, and language that sounds like an advertisement.

The goal is simple: help a real visitor confirm the right store page and understand where current details should be checked.

## FAQ

### Is this guide for Native Medicine Garden only?

Yes. This guide is written for Native Medicine Garden and the local Toronto context connected to this website.

### Does this guide confirm current item details?

No. It is a store information guide. The official store page remains the source for current details.

### Who can use this guide?

This guide is for adults 19+ who want to understand the store page before visiting.

### Does this article change store facts?

No. It does not change store name, location facts, hours, map details, license information, or other locked business facts.`,
    faq: "",
    internal_links_used: "[Native Medicine Garden Toronto store page](/weed-dispensary-toronto)\\n[Native Medicine Garden homepage](/)\\n[More Native Medicine Garden guides](/blog)",
    relatedLinks: [
      {
            "title": "Native Medicine Garden Toronto store page",
            "url": "https://nativemedicinecannabis.com/weed-dispensary-toronto",
            "description": "Primary store-specific destination for current store details after reading the guide."
      },
      {
            "title": "Native Medicine Garden homepage",
            "url": "https://nativemedicinecannabis.com/",
            "description": "Store-scoped general navigation for adults 19+."
      },
      {
            "title": "More Native Medicine Garden guides",
            "url": "https://nativemedicinecannabis.com/blog",
            "description": "Store-scoped blog index for future approved posts."
      }
],
  },
];

export function getStaticPost(slug: string) {
  return STATIC_POSTS.find((post) => post.slug === slug);
}
