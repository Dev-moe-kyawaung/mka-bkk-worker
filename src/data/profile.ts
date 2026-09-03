export interface Scene {
  id: string;
  index: string;
  label: string;
  title: string;
  blurb: string;
}

export interface Metric {
  value: number;
  suffix: string;
  label: string;
  note: string;
}

export interface LinkItem {
  id: string;
  label: string;
  handle: string;
  href: string;
  icon: 'mail' | 'logo-github' | 'logo-linkedin' | 'chatbubble-ellipses' | 'globe';
  color: string;
}

export const profile = {
  name: 'Dario Vlas',
  initials: 'DV',
  role: 'Senior Mobile Engineer',
  focus: 'Flutter · Kotlin · Cross-Platform Architecture',
  tagline:
    'I design mobile systems that hold 60fps on a five-year-old phone — and stay readable five years later.',
  location: 'Berlin, DE · remote-first',
  availability: 'Open to staff / principal mobile roles — Q4 2026',
  years: 9,
  email: 'hello@dariovlas.dev',
  github: 'github.com/dariovlas',
  linkedin: 'linkedin.com/in/dariovlas',
  stats: '9 yrs · 34 apps · 12.4M MAU · 4.8★ avg',
};

export const scenes: Scene[] = [
  {
    id: 'hero',
    index: '00',
    label: 'Intro',
    title: 'Mobile systems, rendered in 3D',
    blurb: 'A scroll-driven tour through nine years of shipped mobile software.',
  },
  {
    id: 'metrics',
    index: '01',
    label: 'Impact',
    title: 'Numbers that survived production',
    blurb: 'Measured on real devices, not on slides.',
  },
  {
    id: 'gallery',
    index: '02',
    label: 'Work',
    title: 'Selected work',
    blurb: 'Six builds. Tap a device to open the full case study.',
  },
  {
    id: 'galaxy',
    index: '03',
    label: 'Skills',
    title: 'Skills galaxy',
    blurb: 'Every particle is a skill. Tap one for depth, filter by orbit.',
  },
  {
    id: 'architecture',
    index: '04',
    label: 'Architecture',
    title: 'The architecture I keep reusing',
    blurb: 'A modular monolith with a pure domain core, data on the inside, UI on the edge.',
  },
  {
    id: 'contact',
    index: '05',
    label: 'Contact',
    title: 'Contact constellation',
    blurb: 'The lines draw themselves as you arrive.',
  },
];

export const metrics: Metric[] = [
  { value: 12.4, suffix: 'M', label: 'Monthly active users', note: 'across 6 shipped apps' },
  { value: 34, suffix: '', label: 'Apps shipped', note: 'Flutter, native, and hybrid' },
  { value: 98, suffix: '%', label: 'Crash-free sessions', note: 'P95 across the fleet' },
  { value: 41, suffix: '%', label: 'Cold-start reduction', note: 'Kestrel Bank 3.x to 4.x' },
  { value: 18, suffix: '', label: 'Engineers mentored', note: '6 promoted to senior' },
  { value: 60, suffix: 'fps', label: 'Frame budget held', note: 'mid-tier Android, jank < 0.4%' },
];

export const timeline = [
  {
    year: '2024 —',
    role: 'Principal Mobile Engineer',
    org: 'Kestrel (fintech)',
    note: 'Owned the KMP rewrite of a 340-screen neobank.',
  },
  {
    year: '2021 — 24',
    role: 'Staff Mobile Engineer',
    org: 'Lumen Health',
    note: 'Flutter platform team, offline-first clinical flows.',
  },
  {
    year: '2018 — 21',
    role: 'Senior Android Engineer',
    org: 'Nimbus',
    note: 'Realtime chat and WebRTC, 4M DAU event peaks.',
  },
  {
    year: '2016 — 18',
    role: 'Mobile Engineer',
    org: 'Atlas Logistics',
    note: 'Kotlin routing client for 12k drivers.',
  },
];

export const links: LinkItem[] = [
  {
    id: 'email',
    label: 'Email',
    handle: 'hello@dariovlas.dev',
    href: 'mailto:hello@dariovlas.dev',
    icon: 'mail',
    color: '#5EE7FF',
  },
  {
    id: 'github',
    label: 'GitHub',
    handle: '@dariovlas',
    href: 'https://github.com',
    icon: 'logo-github',
    color: '#A97BFF',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: '/in/dariovlas',
    href: 'https://linkedin.com',
    icon: 'logo-linkedin',
    color: '#4E9BFF',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    handle: '@dariovlas',
    href: 'https://telegram.org',
    icon: 'chatbubble-ellipses',
    color: '#FF77C4',
  },
];

export const experience = timeline;
