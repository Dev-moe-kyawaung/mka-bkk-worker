import { Project } from '../data/projects';

export function buildCaseStudy(p: Project): string {
  const meta = [
    `**Client** — ${p.client}`,
    `**Role** — ${p.role}`,
    `**Window** — ${p.year} · ${p.duration}`,
    `**Team** — ${p.team}`,
    `**Surfaces** — ${p.platforms.join(' · ')}`,
  ].join('\n');

  const approach = p.approach.map((a) => `- ${a}`).join('\n');
  const results = p.results.map((r) => `- ${r}`).join('\n');
  const stack = p.stack.map((s) => `- ${s}`).join('\n');

  return `# ${p.name}

${p.tagline}

${meta}

## The problem

${p.problem}

## What I built

${approach}

## Architecture

\`\`\`mermaid
${p.mermaid.trim()}\`\`\`

## Implementation notes

${p.snippet.caption}

\`\`\`${p.snippet.lang}
${p.snippet.code}
\`\`\`

## Results

${results}

## Stack

${stack}

> Case study condensed from the internal postmortem. Numbers are production measurements
> taken over the release window, not benchmarks on a lucky device.
`;
}
