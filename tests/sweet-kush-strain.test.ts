import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SWEET_KUSH_STRAIN_ARTICLE,
  SWEET_KUSH_STRAIN_BODY,
  SWEET_KUSH_STRAIN_CANONICAL,
  SWEET_KUSH_STRAIN_DESCRIPTION,
  SWEET_KUSH_STRAIN_SEO_TITLE,
  SWEET_KUSH_STRAIN_TITLE,
} from "../app/resources/sweetKushStrain.ts";
import { parseResourceMarkdown, resourceMarkdownHrefs, resourceMarkdownPlainText } from "../app/resources/resourceMarkdown.ts";

const TITLE = "Sweet Kush Strain, Explained: Style Tag vs Package Panel";
const CANONICAL = "https://www.nativemedicinecannabis.com/resources/sweet-kush-strain";
const BODY_SHA256 = "644a5742257dd62fd59170be8e153367c14b7d976880071e95f5ab565de9f443";

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
    const text = line.replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");
    out.push(stripInline(text));
  }
  return out.join("\n");
}

test("the published sweet-kush body matches the approved draft word for word", () => {
  assert.equal(SWEET_KUSH_STRAIN_TITLE, TITLE);
  assert.equal(SWEET_KUSH_STRAIN_BODY.startsWith(`# ${TITLE}\n`), true);
  assert.equal(SWEET_KUSH_STRAIN_BODY.includes("Last checked: November 3, 2026"), true);
  assert.equal(createHash("sha256").update(SWEET_KUSH_STRAIN_BODY).digest("hex"), BODY_SHA256);
  assert.equal(SWEET_KUSH_STRAIN_BODY.includes("3.5"), false);
  assert.equal(SWEET_KUSH_STRAIN_BODY.includes("Farmers Link"), false);
  assert.equal(/https?:\/\//.test(SWEET_KUSH_STRAIN_BODY), false);
  assert.equal(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(SWEET_KUSH_STRAIN_BODY), false);
  assert.deepEqual(resourceMarkdownHrefs(SWEET_KUSH_STRAIN_BODY), [
    "/resources/what-is-craft-cannabis",
    "/visit",
  ]);
  assert.equal(resourceMarkdownPlainText(SWEET_KUSH_STRAIN_BODY), naivePlain(SWEET_KUSH_STRAIN_BODY));
  const blocks = parseResourceMarkdown(SWEET_KUSH_STRAIN_BODY);
  assert.equal(blocks.filter((block) => block.type === "h1").length, 1);
  assert.equal(blocks.find((block) => block.type === "h1")?.text, TITLE);
  assert.equal(blocks.some((block) => block.type === "p" && block.text === "Last checked: November 3, 2026"), true);
  const tables = blocks.filter((block) => block.type === "table");
  assert.equal(tables.length, 2);
  assert.ok(tables[0].type === "table" && tables[1].type === "table");
  assert.deepEqual(tables[0].headers, ["Style tag says", "What it's reporting", "What it can't prove"]);
  assert.equal(tables[0].rows.length, 3);
  assert.deepEqual(tables[1].headers, ["Panel line", "What it tells you"]);
  assert.equal(tables[1].rows.length, 5);
});

test("metadata and article schema stay on this slug and off the resources redirect", () => {
  assert.ok(SWEET_KUSH_STRAIN_DESCRIPTION.length <= 155);
  assert.equal(SWEET_KUSH_STRAIN_DESCRIPTION, "There's the name on the tag, and there's the information on the package panel.");
  assert.equal(SWEET_KUSH_STRAIN_DESCRIPTION.includes("3.5"), false);
  assert.equal(/\b(price|prices|deal|deals|hours)\b/i.test(SWEET_KUSH_STRAIN_DESCRIPTION), false);
  assert.equal(SWEET_KUSH_STRAIN_SEO_TITLE, `${TITLE} | Native Medicine Garden`);
  assert.equal(SWEET_KUSH_STRAIN_CANONICAL, CANONICAL);
  assert.deepEqual(SWEET_KUSH_STRAIN_ARTICLE, {
    datePublished: "2026-11-16",
    dateModified: "2026-11-16",
    author: "Native Medicine Garden Cannabis Dispensary",
    publisher: "Native Medicine Garden Cannabis Dispensary",
  });

  const data = readFileSync(new URL("../app/resources/resourceData.ts", import.meta.url), "utf8");
  assert.match(data, /slug: "sweet-kush-strain"/);
  assert.match(data, /title: SWEET_KUSH_STRAIN_TITLE/);
  assert.match(data, /seoTitle: SWEET_KUSH_STRAIN_SEO_TITLE/);
  assert.match(data, /description: SWEET_KUSH_STRAIN_DESCRIPTION/);
  assert.match(data, /bodyMarkdown: SWEET_KUSH_STRAIN_BODY/);
  assert.match(data, /articleMeta: SWEET_KUSH_STRAIN_ARTICLE/);
  assert.match(data, /schemaType: "Article"/);
  assert.match(data, /schemaBreadcrumb: false/);
  assert.match(data, /CANNABIS_FLOWER_SIZES_PAGE, WHAT_IS_CRAFT_CANNABIS_PAGE, HASH_FORMATS_LEGAL_MENU_PAGE, SWEET_KUSH_STRAIN_PAGE/);

  const view = readFileSync(new URL("../app/resources/ResourceView.tsx", import.meta.url), "utf8");
  assert.match(view, /headline: page\.title/);
  assert.match(view, /datePublished: page\.articleMeta\.datePublished/);
  assert.match(view, /dateModified: page\.articleMeta\.dateModified/);
  assert.match(view, /mainEntityOfPage: canonicalUrl/);
  assert.match(view, /page\.schemaBreadcrumb === false/);
  assert.equal(view.includes("AggregateRating"), false);
  assert.equal(view.includes("Review"), false);
  assert.equal(view.includes('"@type": "Product"'), false);
  assert.equal(view.includes("Offer"), false);

  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /source: "\/resources", destination: "\/weed-resources", permanent: true/);
  assert.equal(config.includes('source: "/resources/:path*"'), false);
  assert.equal(config.includes('source: "/resources/:slug*"'), false);
  assert.equal(config.includes("sweet-kush-strain"), false);

  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /page\.slug \? `\$\{BASE\}\/resources\/\$\{page\.slug\}`/);
  assert.match(sitemap, /const BASE = "https:\/\/www\.nativemedicinecannabis\.com"/);
});
