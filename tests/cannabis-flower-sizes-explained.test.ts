import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CANNABIS_FLOWER_SIZES_ARTICLE,
  CANNABIS_FLOWER_SIZES_BODY,
  CANNABIS_FLOWER_SIZES_CANONICAL,
  CANNABIS_FLOWER_SIZES_DESCRIPTION,
  CANNABIS_FLOWER_SIZES_SEO_TITLE,
  CANNABIS_FLOWER_SIZES_TITLE,
} from "../app/resources/cannabisFlowerSizesExplained.ts";
import { parseResourceMarkdown, resourceMarkdownHrefs, resourceMarkdownPlainText } from "../app/resources/resourceMarkdown.ts";

const TITLE = "Ounce of Weed Toronto Guide: The 3g-to-28g Flower Size Ladder, Decoded";
const CANONICAL = "https://www.nativemedicinecannabis.com/resources/cannabis-flower-sizes-explained";

function stripInline(value: string): string {
  return value.replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, "$1").replace(/\*\*/g, "");
}

function naivePlain(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.trim().startsWith("|")) {
      const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
      out.push(cells.map(stripInline).join("\t"));
      continue;
    }
    const text = line.replace(/^#{1,2}\s+/, "").replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
    out.push(stripInline(text));
  }
  return out.join("\n");
}

test("the published flower-size body matches the approved draft word for word", () => {
  assert.equal(CANNABIS_FLOWER_SIZES_TITLE, TITLE);
  assert.equal(CANNABIS_FLOWER_SIZES_BODY.startsWith(`# ${TITLE}\n`), true);
  assert.equal(CANNABIS_FLOWER_SIZES_BODY.includes("Last checked: October 21, 2026"), true);
  assert.equal(CANNABIS_FLOWER_SIZES_BODY.includes("[visit page](/visit)"), true);
  assert.equal(CANNABIS_FLOWER_SIZES_BODY.includes("3.5"), false);
  assert.equal(/https?:\/\//.test(CANNABIS_FLOWER_SIZES_BODY), false);
  assert.equal(CANNABIS_FLOWER_SIZES_BODY.includes("/items/"), false);
  assert.deepEqual(resourceMarkdownHrefs(CANNABIS_FLOWER_SIZES_BODY), ["/visit"]);
  assert.equal(resourceMarkdownPlainText(CANNABIS_FLOWER_SIZES_BODY), naivePlain(CANNABIS_FLOWER_SIZES_BODY));
  const blocks = parseResourceMarkdown(CANNABIS_FLOWER_SIZES_BODY);
  assert.equal(blocks.filter((block) => block.type === "h1").length, 1);
  assert.equal(blocks.find((block) => block.type === "h1")?.text, TITLE);
  const table = blocks.find((block) => block.type === "table");
  assert.ok(table && table.type === "table");
  assert.deepEqual(table.headers, ["Size on the menu", "Share of a 28g ounce", "What people sometimes call it"]);
  assert.equal(table.rows.length, 4);
});

test("metadata, article schema fields and the resources index card are additive", () => {
  assert.equal(CANNABIS_FLOWER_SIZES_DESCRIPTION.length, 150);
  assert.equal(CANNABIS_FLOWER_SIZES_DESCRIPTION.includes("3.5"), false);
  assert.equal(/\b(price|prices|deal|deals|hours)\b/i.test(CANNABIS_FLOWER_SIZES_DESCRIPTION), false);
  assert.equal(CANNABIS_FLOWER_SIZES_SEO_TITLE, `${TITLE} | Native Medicine Garden`);
  assert.equal(CANNABIS_FLOWER_SIZES_CANONICAL, CANONICAL);
  assert.deepEqual(CANNABIS_FLOWER_SIZES_ARTICLE, {
    datePublished: "2026-10-25",
    dateModified: "2026-10-25",
    author: "Native Medicine Garden Cannabis Dispensary",
    publisher: "Native Medicine Garden Cannabis Dispensary",
  });

  const cigaretteStrip = /(?:(?:native\s+)?(?:cigarettes?|tobacco)|grabba(?:\s+shaker)?)/i;
  assert.equal(cigaretteStrip.test(CANNABIS_FLOWER_SIZES_BODY), false);
  assert.equal(cigaretteStrip.test(CANNABIS_FLOWER_SIZES_DESCRIPTION), false);

  const data = readFileSync(new URL("../app/resources/resourceData.ts", import.meta.url), "utf8");
  assert.match(data, /slug: "cannabis-flower-sizes-explained"/);
  assert.match(data, /title: CANNABIS_FLOWER_SIZES_TITLE/);
  assert.match(data, /seoTitle: CANNABIS_FLOWER_SIZES_SEO_TITLE/);
  assert.match(data, /description: CANNABIS_FLOWER_SIZES_DESCRIPTION/);
  assert.match(data, /bodyMarkdown: CANNABIS_FLOWER_SIZES_BODY/);
  assert.match(data, /articleMeta: CANNABIS_FLOWER_SIZES_ARTICLE/);
  assert.match(data, /schemaType: "Article"/);
  assert.match(data, /CANNABIS_FLOWER_SIZES_CARD/);
  for (const href of [
    "/resources/cannabis-101",
    "/resources/weed-flower-guide",
    "/resources/cannabis-menu-guide",
    "/resources/downtown-bay-street-weed-visit-guide",
  ]) {
    assert.equal(data.includes(`href: "${href}"`), true);
  }

  const view = readFileSync(new URL("../app/resources/ResourceView.tsx", import.meta.url), "utf8");
  assert.match(view, /headline: page\.title/);
  assert.match(view, /datePublished: page\.articleMeta\.datePublished/);
  assert.match(view, /dateModified: page\.articleMeta\.dateModified/);
  assert.match(view, /mainEntityOfPage: canonicalUrl/);
  assert.equal(view.includes("AggregateRating"), false);
  assert.equal(view.includes("Review"), false);
  assert.equal(view.includes("react-markdown"), false);

  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /source: "\/resources", destination: "\/weed-resources", permanent: true/);
  assert.equal(config.includes('source: "/resources/:path*"'), false);
  assert.equal(config.includes('source: "/resources/:slug*"'), false);

  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /page\.slug \? `\$\{BASE\}\/resources\/\$\{page\.slug\}`/);
});
