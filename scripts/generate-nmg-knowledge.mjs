import fs from "node:fs";
import path from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Pass the PINKY packet path");

const source = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
const routeSections = [...source.matchAll(/^# (\d+)\. (?:NEW|EXPAND) — `((?:\/resources\/)[^`]+)`$/gm)]
  .filter((match) => Number(match[1]) >= 5 && Number(match[1]) <= 25);

function cleanHeading(value) {
  return value.replace(/^(?:H2|H3) — /, "").trim();
}

function cleanInline(value) {
  return value.trim().replace(/  $/, "");
}

function parsePage(match, nextIndex) {
  const block = source.slice(match.index, nextIndex);
  const route = match[2];
  const slug = route.replace(/^\/resources\//, "");
  const seoTitle = block.match(/^\*\*SEO title:\*\* (.+)$/m)?.[1]?.trim();
  const description = block.match(/^\*\*Meta:\*\* (.+)$/m)?.[1]?.trim();
  const h1 = block.match(/^\*\*H1:\*\* (.+)$/m)?.[1]?.trim();
  if (!seoTitle || !description || !h1) throw new Error(`Missing metadata for ${route}`);

  const afterH1 = block.slice(block.indexOf(`**H1:** ${h1}`) + `**H1:** ${h1}`.length).trim();
  const contentEnd = [afterH1.indexOf("**Exact internal links**"), afterH1.indexOf("**Schema:")]
    .filter((value) => value >= 0)
    .sort((a, b) => a - b)[0] ?? afterH1.length;
  const content = afterH1.slice(0, contentEnd).trim();
  const lines = content.split("\n");

  const lead = [];
  const blocks = [];
  const faqs = [];
  let current = null;
  let inFaq = false;
  let pendingFaq = null;

  const flushFaq = () => {
    if (pendingFaq) {
      pendingFaq.answer = pendingFaq.answer.join(" ").trim();
      faqs.push(pendingFaq);
      pendingFaq = null;
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = cleanInline(lines[i]);
    if (!raw || raw === "---") continue;

    const h2 = raw.match(/^## (.+)$/);
    const h3 = raw.match(/^### (.+)$/);
    const boldQuestion = raw.match(/^\*\*(.+\?)\*\*$/);
    if (h2 || h3) {
      const level = h2 ? 2 : 3;
      const heading = cleanHeading((h2 || h3)[1]);
      if (heading === "FAQs") {
        flushFaq();
        inFaq = true;
        current = null;
      } else if (inFaq && level === 3) {
        flushFaq();
        pendingFaq = { question: heading, answer: [] };
      } else {
        current = { level, heading, paragraphs: [], bullets: [], ordered: [] };
        blocks.push(current);
      }
      continue;
    }
    if (inFaq && boldQuestion) {
      flushFaq();
      pendingFaq = { question: boldQuestion[1], answer: [] };
      continue;
    }
    if (inFaq && pendingFaq) {
      pendingFaq.answer.push(raw);
      continue;
    }

    const bullet = raw.match(/^- (.+)$/);
    const ordered = raw.match(/^\d+\. (.+)$/);
    if (current && bullet) current.bullets.push(bullet[1].replace(/;$/, ""));
    else if (current && ordered) current.ordered.push(ordered[1].replace(/;$/, ""));
    else if (current) current.paragraphs.push(raw);
    else lead.push(raw);
  }
  flushFaq();

  const linksBlock = block.match(/\*\*Exact internal links\*\*([\s\S]*?)(?:\n\*\*Schema:|\n---)/)?.[1] || "";
  const links = [...linksBlock.matchAll(/^- `([^`]+)` → `([^`]+)`$/gm)].map((item) => ({
    label: item[1],
    href: item[2],
  }));
  const schemaLine = block.match(/^\*\*Schema:\*\* (.+)$/m)?.[1] || "Article + BreadcrumbList";
  const schemaType = /CollectionPage/.test(schemaLine) ? "CollectionPage" : /WebPage/.test(schemaLine) && !/Article/.test(schemaLine) ? "WebPage" : "Article";

  return {
    slug,
    title: h1,
    seoTitle,
    description,
    eyebrow: slug.startsWith("native-smokes") ? "Native Smokes Education" : slug.startsWith("cannabis-101/") ? "Cannabis 101" : slug.startsWith("flower-guides/") ? "Flower Guide" : "Native Medicine Garden Guide",
    intro: lead.shift() || description,
    lead,
    cards: links.map((link) => ({ ...link, title: link.label, text: `Continue to ${link.label}.` })),
    blocks,
    faqs,
    schemaType,
  };
}

const pages = routeSections.map((match, index) => {
  const next = routeSections[index + 1]?.index ?? source.indexOf("\n# 26.", match.index);
  return parsePage(match, next > match.index ? next : source.length);
});

const copyReplacements = new Map([
  ["The current NMG evidence supports local context around:", "Native Medicine Garden is in downtown Toronto, with local context around:"],
  ["The current version of this guide should explain the language behind those categories without freezing per-gram prices, bundle math or current stock into evergreen education.", "Use this guide to understand the language behind those categories, then use current category and product pages for prices, deals and availability."],
  ["An evergreen educational guide should explain size, not freeze a price rule.", "Bud size does not set a permanent price rule; use the current listing for current price and package details."],
  ["The phrase is useful in everyday search language.", "The phrase is common in everyday conversation."],
  ["“Native Cigarettes” Is Common Search Language", "What People Mean by “Native Cigarettes”"],
  ["Those claims require separate evidence.", "Those questions need to be confirmed separately."],
  ["Brand Names Need Evidence", "Brand Names Do Not Prove Manufacturer or Ownership"],
  ["Those names can be referenced as **observed retail/catalog terminology** when accurate.", "A current store listing shows how a brand is presented for retail browsing."],
  ["Do not infer from the store's menu that a brand is:", "A store menu does not by itself prove that a brand is:"],
  ["Manufacturer or ownership claims require separate verification.", "Manufacturer or ownership details should be confirmed from reliable information about the exact brand."],
  ["Current Prices and Availability Belong on Current Product Surfaces", "Check Current Product Pages for Prices and Availability"],
  ["Educational content should not freeze a cigarette price list into an evergreen authority guide.", "This guide is not a live cigarette price list."],
  ["Native Medicine Garden and Protected Native Wording", "What the Native Medicine Garden Name Does — and Does Not — Tell You"],
  ["No. “Native cigarettes” is common search language, not one single tax category.", "No. “Native cigarettes” is common consumer language, not one single tax category."],
  ["No. A retailer listing can show that a brand is offered or has been catalogued, but ownership/manufacturer claims require separate evidence.", "No. A retailer listing can show that a brand is offered or has been catalogued, but ownership and manufacturer details need to be confirmed separately."],
  ["An evergreen guide to Native-smokes search language, commercial cigarette terminology, brand references and current-menu checking at Native Medicine Garden.", "A guide to Native-smokes terminology, commercial cigarette terms, brand references and current-menu checking at Native Medicine Garden."],
  ["Adults use “Native smokes” as a broad retail/search phrase.", "Adults use “Native smokes” as a broad retail phrase."],
  ["Native-smokes search language", "Native-smokes terminology"],
  ["why current prices and availability belong on current product surfaces", "why current prices and availability belong on current product pages"],
  ["Native Medicine Garden may publicly display cigarette brand names on current product surfaces.", "Native Medicine Garden may publicly display cigarette brand names on current product pages."],
  ["why manufacturer and tax-status claims require evidence.", "why manufacturer identity and tax status need separate confirmation."],
  ["Those details need current product information or separate evidence.", "Those details need current product information or separate confirmation."],
  ["Use Current Product Surfaces for Current Retail Details", "Use Current Product Pages for Current Retail Details"],
  ["No. Evergreen educational content should not be treated as a live price list.", "No. This guide should not be treated as a live price list."],
]);

function correctCopy(value) {
  if (typeof value === "string") return copyReplacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map(correctCopy);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, correctCopy(item)]));
  }
  return value;
}

for (const page of pages) {
  Object.assign(page, correctCopy(page));
}

const nativeCigarettes = pages.find((page) => page.slug === "native-smokes/native-cigarettes-guide");
const identityBlock = nativeCigarettes?.blocks.find((block) => block.heading === "What the Native Medicine Garden Name Does — and Does Not — Tell You");
if (identityBlock) {
  identityBlock.paragraphs = [
    "Native Medicine Garden is the store's business name.",
    "The store name does not, by itself, establish who manufactured or owns every cigarette brand shown on a current menu, or whether a particular sale is tax-exempt.",
    "Those are separate questions that require product- and sale-specific information.",
  ];
}

const valueGuide = pages.find((page) => page.slug === "weed-value-guide");
if (valueGuide) {
  valueGuide.lead = valueGuide.lead.flatMap((line) => {
    if (line === "The old version of this page leaned too heavily on fixed per-gram and bundle prices.") {
      return ["Current prices and bundle details can change."];
    }
    if (line === "Those numbers belong on current commerce surfaces, not in evergreen education.") {
      return ["Use the current category and product pages for today's prices, package details and availability."];
    }
    return [line];
  });
}

const expected = 21;
if (pages.length !== expected) throw new Error(`Expected ${expected} resource pages, found ${pages.length}`);

const outputPath = path.resolve("app/resources/knowledgeData.json");
fs.writeFileSync(outputPath, `${JSON.stringify(pages, null, 2)}\n`, "utf8");
console.log(`Generated ${pages.length} pages at ${outputPath}`);
