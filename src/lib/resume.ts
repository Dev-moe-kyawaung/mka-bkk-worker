import { Platform, Share } from 'react-native';
import { profile, timeline } from '../data/profile';
import { projects } from '../data/projects';
import { skillCategories, skills } from '../data/skills';
import { ThemeName } from '../theme/tokens';

const line = (char = '─', n = 64) => char.repeat(n);

export function buildResume(theme: ThemeName = 'dark'): string {
  const byCategory = skillCategories
    .filter((c) => c.id !== 'All')
    .map((c) => {
      const list = skills
        .filter((s) => s.category === c.id)
        .sort((a, b) => b.level - a.level)
        .map((s) => s.name)
        .join(', ');
      return `${c.label}: ${list}`;
    })
    .join('\n');

  const work = projects
    .map(
      (p) =>
        `${p.name} — ${p.client} (${p.year})\n  ${p.role} · ${p.duration} · ${p.team}\n  ${p.tagline}\n  Wins: ${p.results[0]}`
    )
    .join('\n\n');

  const history = timeline
    .map((t) => `${t.year.padEnd(10)} ${t.role} — ${t.org}\n  ${t.note}`)
    .join('\n');

  return `${line('=')}
${profile.name.toUpperCase()}
${profile.role} · ${profile.focus}
${line('=')}

${profile.tagline}

${profile.location}
${profile.email}  ·  ${profile.github}  ·  ${profile.linkedin}
Availability: ${profile.availability}

EXPERIENCE
${line()}

${history}

SELECTED PROJECTS
${line()}

${work}

SKILLS
${line()}

${byCategory}

CRAFT
${line()}

- ${profile.years} years shipping mobile software across Android, iOS, and shared cores.
- Architecture reviews, RFC authoring, and release ownership for teams up to 12 engineers.
- Performance budgets enforced in CI: startup, frame time, and binary size.
- Theme: ${theme} · generated ${new Date().toISOString().slice(0, 10)} · source: live portfolio build
`;
}

export type ResumeResult = 'downloaded' | 'shared' | 'unavailable';

export async function downloadResume(theme: ThemeName): Promise<ResumeResult> {
  const markdown = buildResume(theme);
  const filename = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-resume.md`;

  if (Platform.OS === 'web') {
    try {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return 'downloaded';
    } catch {
      return 'unavailable';
    }
  }

  try {
    await Share.share({ message: markdown, title: `${profile.name} — resume` });
    return 'shared';
  } catch {
    return 'unavailable';
  }
}
