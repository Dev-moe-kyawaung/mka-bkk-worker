export type Inline =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'italic'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'link'; label: string; href: string };

export type Block =
  | { kind: 'heading'; level: 1 | 2 | 3; inlines: Inline[] }
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'code'; lang: string; source: string }
  | { kind: 'quote'; inlines: Inline[] }
  | { kind: 'mermaid'; source: string }
  | { kind: 'divider' };

const INLINE_RE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const parts = text.split(INLINE_RE).filter((p) => p !== undefined && p !== '');
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      out.push({ kind: 'bold', value: part.slice(2, -2) });
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      out.push({ kind: 'italic', value: part.slice(1, -1) });
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      out.push({ kind: 'code', value: part.slice(1, -1) });
    } else if (part.startsWith('[')) {
      const close = part.indexOf('](');
      const end = part.lastIndexOf(')');
      if (close > 0 && end > close) {
        out.push({ kind: 'link', label: part.slice(1, close), href: part.slice(close + 2, end) });
        continue;
      }
      out.push({ kind: 'text', value: part });
    } else {
      out.push({ kind: 'text', value: part });
    }
  }
  return out.length ? out : [{ kind: 'text', value: '' }];
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'text';
      const buffer: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1;
      const raw = buffer.join('\n');
      if (lang === 'mermaid') blocks.push({ kind: 'mermaid', source: raw });
      else blocks.push({ kind: 'code', lang, source: raw });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push({ kind: 'divider' });
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = Math.min(3, heading[1].length) as 1 | 2 | 3;
      blocks.push({ kind: 'heading', level, inlines: parseInline(heading[2]) });
      i += 1;
      continue;
    }

    if (line.trim().startsWith('>')) {
      blocks.push({ kind: 'quote', inlines: parseInline(line.replace(/^>\s?/, '')) });
      i += 1;
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\s*[-*+]\s+/, '')));
        i += 1;
      }
      blocks.push({ kind: 'list', ordered: false, items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\s*\d+[.)]\s+/, '')));
        i += 1;
      }
      blocks.push({ kind: 'list', ordered: true, items });
      continue;
    }

    const paragraph: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3})\s/.test(lines[i]) &&
      !lines[i].trim().startsWith('```') &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('>')
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: 'paragraph', inlines: parseInline(paragraph.join(' ')) });
  }

  return blocks;
}

export interface MmdNode {
  id: string;
  label: string;
  depth: number;
  index: number;
}

export interface MmdEdge {
  from: string;
  to: string;
}

export interface MmdGraph {
  dir: 'TD' | 'LR';
  nodes: MmdNode[];
  edges: MmdEdge[];
}

const NODE_RE = /^\\s*([A-Za-z0-9_]+)\\s*(?:\\[(.*?)\\])?\\s*(?:-->|-{2,}>|→)\\s*([A-Za-z0-9_]+)\\s*(?:\\[(.*?)\\])?\\s*$/;

/** Minimal mermaid subset: `graph TD` / `graph LR` with `A[Label] --> B[Label]` edges. */
export function parseMermaid(source: string): MmdGraph {
  const dir: 'TD' | 'LR' = /graph\\s+LR/i.test(source.split('\\n')[0] ?? '') ? 'LR' : 'TD';
  const labels = new Map<string, string>();
  const edges: MmdEdge[] = [];

  for (const raw of source.split('\\n')) {
    const line = raw.trim();
    if (!line || /^(graph|flowchart)/i.test(line)) continue;
    const match = line.match(NODE_RE);
    if (!match) continue;
    const [, fromId, fromLabel, toId, toLabel] = match;
    if (fromLabel) labels.set(fromId, fromLabel);
    if (toLabel) labels.set(toId, toLabel);
    edges.push({ from: fromId, to: toId });
  }

  const ids = new Set<string>();
  edges.forEach((e) => {
    ids.add(e.from);
    ids.add(e.to);
  });

  const depth = new Map<string, number>([...ids].map((id) => [id, 0]));
  for (let pass = 0; pass < ids.size; pass += 1) {
    let changed = false;
    for (const edge of edges) {
      const next = (depth.get(edge.from) ?? 0) + 1;
      if (next > (depth.get(edge.to) ?? 0)) {
        depth.set(edge.to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const nodes: MmdNode[] = [...ids].map((id, index) => ({
    id,
    label: labels.get(id) ?? id,
    depth: depth.get(id) ?? 0,
    index,
  }));

  return { dir, nodes, edges };
}
