export type ResourceMarkdownBlock =
  | { type: "h1" | "h2" | "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

function splitCells(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

function isSeparator(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export function parseResourceMarkdown(markdown: string): ResourceMarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ResourceMarkdownBlock[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const heading = /^(#{1,2})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({ type: heading[1].length === 1 ? "h1" : "h2", text: heading[2] });
      index += 1;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        const cells = splitCells(lines[index]);
        if (!isSeparator(cells)) rows.push(cells);
        index += 1;
      }
      const [headers, ...body] = rows;
      if (headers) blocks.push({ type: "table", headers, rows: body });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    blocks.push({ type: "p", text: line });
    index += 1;
  }
  return blocks;
}

function stripInline(value: string): string {
  return value.replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, "$1").replace(/\*\*/g, "");
}

export function resourceMarkdownPlainText(markdown: string): string {
  return parseResourceMarkdown(markdown).map((block) => {
    if (block.type === "h1" || block.type === "h2" || block.type === "p") return stripInline(block.text);
    if (block.type === "ul" || block.type === "ol") return block.items.map(stripInline).join("\n");
    if (block.type === "table") return [block.headers, ...block.rows].map((row) => row.map(stripInline).join("\t")).join("\n");
    return "";
  }).join("\n");
}

export function resourceMarkdownHrefs(markdown: string): string[] {
  return [...markdown.matchAll(/\[([^\]]+)\]\((\/[^)\s]+)\)/g)].map((match) => match[2]);
}
