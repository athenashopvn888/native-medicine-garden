import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  HASH_FORMATS_LEGAL_MENU_ARTICLE,
  HASH_FORMATS_LEGAL_MENU_BODY,
  HASH_FORMATS_LEGAL_MENU_CANONICAL,
  HASH_FORMATS_LEGAL_MENU_DESCRIPTION,
  HASH_FORMATS_LEGAL_MENU_SEO_TITLE,
  HASH_FORMATS_LEGAL_MENU_TITLE,
} from "../app/resources/hashFormatsLegalMenu.ts";
import { parseResourceMarkdown, resourceMarkdownHrefs, resourceMarkdownPlainText } from "../app/resources/resourceMarkdown.ts";

const TITLE = "Hash on a legal menu: pressed, ice-water and “Moroccan-style” as label words";
const CANONICAL = "https://www.nativemedicinecannabis.com/resources/hash-formats-legal-menu";
const BODY_SHA256 = "68238dfcb92e4be53317e09866c848e464b33dd402110dac822a3b972a628cdb";

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

test("the published hash-formats body matches the approved draft word for word", () => {
  assert.equal(HASH_FORMATS_LEGAL_MENU_TITLE, TITLE);
  assert.equal(HASH_FORMATS_LEGAL_MENU_BODY.startsWith(`# ${TITLE}\n`), true);
  assert.equal(HASH_FORMATS_LEGAL_MENU_BODY.includes("Last checked: October 25, 2026"), true);
  assert.equal(createHash("sha256").update(HASH_FORMATS_LEGAL_MENU_BODY).digest("hex"), BODY_SHA256);
  assert.equal(HASH_FORMATS_LEGAL_MENU_BODY.includes("3.5"), false);
  assert.equal(HASH_FORMATS_LEGAL_MENU_BODY.includes("Farmers Link"), false);
  assert.equal(/https?:\/\//.test(HASH_FORMATS_LEGAL_MENU_BODY), false);
  assert.equal(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(HASH_FORMATS_LEGAL_MENU_BODY), false);
  assert.equal(HASH_FORMATS_LEGAL_MENU_BODY.includes("/items/"), false);
  assert.deepEqual(resourceMarkdownHrefs(HASH_FORMATS_LEGAL_MENU_BODY), [
    "/visit",
    "/resources/cannabis-101",
  ]);
  assert.equal(resourceMarkdownPlainText(HASH_FORMATS_LEGAL_MENU_BODY), naivePlain(HASH_FORMATS_LEGAL_MENU_BODY));
  const blocks = parseResourceMarkdown(HASH_FORMATS_LEGAL_MENU_BODY);
  assert.equal(blocks.filter((block) => block.type === "h1").length, 1);
  assert.equal(blocks.find((block) => block.type === "h1")?.text, TITLE);
  assert.equal(blocks.some((block) => block.type === "p" && block.text === "Last checked: October 25, 2026"), true);
  assert.deepEqual(
    blocks.filter((block) => block.type === "h3").map((block) => block.text),
    [
      "Pressed hash",
      "Ice-water hash (bubble hash)",
      "“Moroccan-style” (and similar traditional style names)",
    ],
  );
  const table = blocks.find((block) => block.type === "table");
  assert.ok(table && table.type === "table");
  assert.deepEqual(table.headers, ["Menu phrase", "What it roughly signals", "What it does not tell you"]);
  assert.equal(table.rows.length, 3);
});

test("metadata and article schema stay on this slug and off the resources redirect", () => {
  assert.ok(HASH_FORMATS_LEGAL_MENU_DESCRIPTION.length <= 155);
  assert.equal(HASH_FORMATS_LEGAL_MENU_DESCRIPTION.includes("3.5"), false);
  assert.equal(/\b(price|prices|deal|deals|hours)\b/i.test(HASH_FORMATS_LEGAL_MENU_DESCRIPTION), false);
  assert.equal(HASH_FORMATS_LEGAL_MENU_SEO_TITLE, `${TITLE} | Native Medicine Garden`);
  assert.equal(HASH_FORMATS_LEGAL_MENU_CANONICAL, CANONICAL);
  assert.deepEqual(HASH_FORMATS_LEGAL_MENU_ARTICLE, {
    datePublished: "2026-11-09",
    dateModified: "2026-11-09",
    author: "Native Medicine Garden Cannabis Dispensary",
    publisher: "Native Medicine Garden Cannabis Dispensary",
  });

  const data = readFileSync(new URL("../app/resources/resourceData.ts", import.meta.url), "utf8");
  assert.match(data, /slug: "hash-formats-legal-menu"/);
  assert.match(data, /title: HASH_FORMATS_LEGAL_MENU_TITLE/);
  assert.match(data, /seoTitle: HASH_FORMATS_LEGAL_MENU_SEO_TITLE/);
  assert.match(data, /description: HASH_FORMATS_LEGAL_MENU_DESCRIPTION/);
  assert.match(data, /bodyMarkdown: HASH_FORMATS_LEGAL_MENU_BODY/);
  assert.match(data, /articleMeta: HASH_FORMATS_LEGAL_MENU_ARTICLE/);
  assert.match(data, /schemaType: "Article"/);
  assert.match(data, /schemaBreadcrumb: false/);
  assert.match(data, /CANNABIS_FLOWER_SIZES_PAGE, WHAT_IS_CRAFT_CANNABIS_PAGE, HASH_FORMATS_LEGAL_MENU_PAGE/);

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
  assert.equal(config.includes("hash-formats-legal-menu"), false);

  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.match(sitemap, /page\.slug \? `\$\{BASE\}\/resources\/\$\{page\.slug\}`/);
  assert.match(sitemap, /const BASE = "https:\/\/www\.nativemedicinecannabis\.com"/);
});
