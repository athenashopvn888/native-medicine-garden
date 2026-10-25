import Link from "next/link";
import type { ReactNode } from "react";
import { parseResourceMarkdown, type ResourceMarkdownBlock } from "./resourceMarkdown";
import styles from "./resources.module.css";

function inlineText(value: string, keyPrefix: string): ReactNode[] {
  return value.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(\/[^)\s]+\))/g).filter((part) => part.length > 0).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    const link = /^\[([^\]]+)\]\((\/[^)\s]+)\)$/.exec(part);
    if (link && isSameSiteHref(link[2])) {
      return <Link key={key} href={link[2]}>{link[1]}</Link>;
    }
    return part;
  });
}

function isSameSiteHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && href !== "/items" && !href.startsWith("/items/");
}

function renderBlock(block: ResourceMarkdownBlock, key: string) {
  if (block.type === "p") {
    const checked = block.text === "Last checked: October 21, 2026";
    return <p key={key} className={checked ? styles.checked : undefined}>{inlineText(block.text, key)}</p>;
  }
  if (block.type === "ul") {
    return <ul key={key}>{block.items.map((item, index) => <li key={`${key}-${index}`}>{inlineText(item, `${key}-${index}`)}</li>)}</ul>;
  }
  if (block.type === "ol") {
    return <ol key={key}>{block.items.map((item, index) => <li key={`${key}-${index}`}>{inlineText(item, `${key}-${index}`)}</li>)}</ol>;
  }
  if (block.type === "table") {
    return (
      <div key={key} className={styles.tableWrap}>
        <table className={styles.sizeTable}>
          <thead>
            <tr>{block.headers.map((header, index) => <th key={`${key}-h-${index}`} scope="col">{inlineText(header, `${key}-h-${index}`)}</th>)}</tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${key}-r-${rowIndex}`}>
                {row.map((cell, cellIndex) => <td key={`${key}-c-${rowIndex}-${cellIndex}`}>{inlineText(cell, `${key}-c-${rowIndex}-${cellIndex}`)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

export default function ResourceMarkdownBody({ markdown }: { markdown: string }) {
  const preamble: ResourceMarkdownBlock[] = [];
  const sections: { heading: string; blocks: ResourceMarkdownBlock[] }[] = [];
  for (const block of parseResourceMarkdown(markdown)) {
    if (block.type === "h1") continue;
    if (block.type === "h2") {
      sections.push({ heading: block.text, blocks: [] });
      continue;
    }
    if (sections.length === 0) preamble.push(block);
    else sections[sections.length - 1].blocks.push(block);
  }

  return (
    <>
      {preamble.length > 0 && (
        <section className={styles.lead}>
          {preamble.map((block, index) => renderBlock(block, `pre-${index}`))}
        </section>
      )}
      <section className={styles.body}>
        {sections.map((section) => (
          <article key={section.heading} className={styles.section}>
            <h2>{inlineText(section.heading, section.heading)}</h2>
            {section.blocks.map((block, index) => renderBlock(block, `${section.heading}-${index}`))}
          </article>
        ))}
      </section>
    </>
  );
}
