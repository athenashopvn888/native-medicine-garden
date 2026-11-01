import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  WHAT_IS_CRAFT_CANNABIS_ARTICLE,
  WHAT_IS_CRAFT_CANNABIS_BODY,
  WHAT_IS_CRAFT_CANNABIS_CANONICAL,
  WHAT_IS_CRAFT_CANNABIS_DESCRIPTION,
  WHAT_IS_CRAFT_CANNABIS_SEO_TITLE,
  WHAT_IS_CRAFT_CANNABIS_TITLE,
} from "../app/resources/whatIsCraftCannabis.ts";
import { parseResourceMarkdown, resourceMarkdownHrefs, resourceMarkdownPlainText } from "../app/resources/resourceMarkdown.ts";

const TITLE = "What Is Craft Cannabis? Small Batch, Hand Trimmed and Other Words, Unpacked";
const CANONICAL = "https://www.nativemedicinecannabis.com/resources/what-is-craft-cannabis";
const BODY_SHA256 = "9f0c81054058732c2e914728f9c9a2ae13cc9f358a3c2589204a3e070966b017";

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

test("the published craft-cannabis body matches the approved draft word for word", () => {
  assert.equal(WHAT_IS_CRAFT_CANNABIS_TITLE, TITLE);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_BODY.startsWith(`# ${TITLE}\n`), true);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_BODY.includes("Last checked: October 25, 2026"), true);
  assert.equal(createHash("sha256").update(WHAT_IS_CRAFT_CANNABIS_BODY).digest("hex"), BODY_SHA256);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_BODY.includes("3.5"), false);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_BODY.includes("Farmers Link"), false);
  assert.equal(/https?:\/\//.test(WHAT_IS_CRAFT_CANNABIS_BODY), false);
  assert.equal(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(WHAT_IS_CRAFT_CANNABIS_BODY), false);
  assert.deepEqual(resourceMarkdownHrefs(WHAT_IS_CRAFT_CANNABIS_BODY), [
    "/weed-dispensary-gerrard-bay",
    "/visit",
  ]);
  assert.equal(resourceMarkdownPlainText(WHAT_IS_CRAFT_CANNABIS_BODY), naivePlain(WHAT_IS_CRAFT_CANNABIS_BODY));
  const blocks = parseResourceMarkdown(WHAT_IS_CRAFT_CANNABIS_BODY);
  assert.equal(blocks.filter((block) => block.type === "h1").length, 1);
  assert.equal(blocks.find((block) => block.type === "h1")?.text, TITLE);
  assert.equal(blocks.some((block) => block.type === "p" && block.text === "Last checked: October 25, 2026"), true);
  const table = blocks.find((block) => block.type === "table");
  assert.ok(table && table.type === "table");
  assert.deepEqual(table.headers, ["Phrase", "What it describes"]);
  assert.equal(table.rows.length, 6);
});

test("metadata and article schema stay on this slug and off the resources redirect", () => {
  assert.ok(WHAT_IS_CRAFT_CANNABIS_DESCRIPTION.length <= 155);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_DESCRIPTION.includes("3.5"), false);
  assert.equal(/\b(price|prices|deal|deals|hours)\b/i.test(WHAT_IS_CRAFT_CANNABIS_DESCRIPTION), false);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_SEO_TITLE, `${TITLE} | Native Medicine Garden`);
  assert.equal(WHAT_IS_CRAFT_CANNABIS_CANONICAL, CANONICAL);
  assert.deepEqual(WHAT_IS_CRAFT_CANNABIS_ARTICLE, {
    datePublished: "2026-11-01",
    dateModified: "2026-11-01",
    author: "Native Medicine Garden Cannabis Dispensary",
    publisher: "Native Medicine Garden Cannabis Dispensary",
  });

  const data = readFileSync(new URL("../app/resources/resourceData.ts", import.meta.url), "utf8");
  assert.match(data, /slug: "what-is-craft-cannabis"/);
  assert.match(data, /title: WHAT_IS_CRAFT_CANNABIS_TITLE/);
  assert.match(data, /seoTitle: WHAT_IS_CRAFT_CANNABIS_SEO_TITLE/);
  assert.match(data, /description: WHAT_IS_CRAFT_CANNABIS_DESCRIPTION/);
  assert.match(data, /bodyMarkdown: WHAT_IS_CRAFT_CANNABIS_BODY/);
  assert.match(data, /articleMeta: WHAT_IS_CRAFT_CANNABIS_ARTICLE/);
  assert.match(data, /schemaType: "Article"/);
  assert.match(data, /schemaBreadcrumb: false/);
  assert.match(data, /CANNABIS_FLOWER_SIZES_PAGE, WHAT_IS_CRAFT_CANNABIS_PAGE/);

  const view = readFileSync(new URL("../app/resources/ResourceView.tsx", import.meta.url), "utf8");
  assert.match(view, /headline: page\.title/);
  assert.match(view, /datePublished: page\.articleMeta\.datePublished/);
  assert.match(view, /dateModified: page\.articleMeta\.dateModified/);
  assert.match(view, /mainEntityOfPage: canonicalUrl/);
  assert.match(view, /page\.schemaBreadcrumb === false/);
  assert.equal(view.includes("AggregateRating"), false);
  assert.equal(view.includes("Review"), false);
  assert.equal(view.includes("Offer"), false);

  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /source: "\/resources", destination: "\/weed-resources", permanent: true/);
  assert.equal(config.includes('source: "/resources/:path*"'), false);
  assert.equal(config.includes('source: "/resources/:slug*"'), false);
  assert.equal(config.includes("what-is-craft-cannabis"), false);

  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /page\.slug \? `\$\{BASE\}\/resources\/\$\{page\.slug\}`/);
  assert.match(sitemap, /const BASE = "https:\/\/www\.nativemedicinecannabis\.com"/);
});
