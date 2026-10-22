import type { Metadata } from "next";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { loadFleetArticles, mergeArticleLinks } from "../lib/fleet/articles";
import { FLEET_ARTICLES_PATH, FLEET_ORIGIN, FLEET_STORE_NAME } from "../lib/fleet/config";
import { codedContentSlugs } from "../lib/fleet/codedSlugs";
import { RESOURCE_PAGES } from "../resources/resourceData";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Articles",
  description: `Guides and articles from ${FLEET_STORE_NAME}.`,
  alternates: { canonical: `${FLEET_ORIGIN}${FLEET_ARTICLES_PATH}` },
};

function codedLinks() {
  return RESOURCE_PAGES.filter((page) => page.slug).map((page) => ({
    slug: page.slug,
    title: page.title,
    href: `/resources/${page.slug}`,
  }));
}

export default async function ArticlesPage() {
  try {
    const loaded = await loadFleetArticles();
    if (!loaded.ok) notFound();
    const reserved = codedContentSlugs();
    const links = mergeArticleLinks(codedLinks(), loaded.articles.filter((article) => !reserved.has(article.slug)));
    return (
      <>
        <Navbar />
        <main>
          <h1>Articles</h1>
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    unstable_rethrow(error);
    notFound();
  }
}
