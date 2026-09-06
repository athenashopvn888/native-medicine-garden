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

const expected = 21;
if (pages.length !== expected) throw new Error(`Expected ${expected} resource pages, found ${pages.length}`);

const outputPath = path.resolve("app/resources/knowledgeData.json");
fs.writeFileSync(outputPath, `${JSON.stringify(pages, null, 2)}\n`, "utf8");
console.log(`Generated ${pages.length} pages at ${outputPath}`);
