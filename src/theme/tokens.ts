import { Platform } from 'react-native';

export type ThemeName = 'dark' | 'light';

export interface Palette {
  name: ThemeName;
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  text: string;
  textDim: string;
  textFaint: string;
  accent: string;
  accent2: string;
  accent3: string;
  positive: string;
  warning: string;
  navBg: string;
  scrim: string;
}

export const palettes: Record<ThemeName, Palette> = {
  dark: {
    name: 'dark',
    bg: '#05060D',
    bgDeep: '#02030A',
    surface: 'rgba(255,255,255,0.045)',
    surfaceStrong: 'rgba(14,17,34,0.92)',
    border: 'rgba(255,255,255,0.10)',
    text: '#EEF0FA',
    textDim: '#98A1C4',
    textFaint: '#5C6488',
    accent: '#5EE7FF',
    accent2: '#A97BFF',
    accent3: '#FF77C4',
    positive: '#5AF2A1',
    warning: '#FFC46B',
    navBg: 'rgba(5,6,13,0.82)',
    scrim: 'rgba(2,3,10,0.72)',
  },
  light: {
    name: 'light',
    bg: '#F5F3EE',
    bgDeep: '#EBE8E1',
    surface: 'rgba(15,19,40,0.04)',
    surfaceStrong: 'rgba(255,255,255,0.94)',
    border: 'rgba(15,19,40,0.12)',
    text: '#101428',
    textDim: '#565E80',
    textFaint: '#8C93AE',
    accent: '#0B87B5',
    accent2: '#6B3BD6',
    accent3: '#D13C92',
    positive: '#0E9E63',
    warning: '#B47414',
    navBg: 'rgba(245,243,238,0.86)',
    scrim: 'rgba(245,243,238,0.78)',
  },
};

export const radii = { xs: 8, sm: 12, md: 18, lg: 26, xl: 36, pill: 999 };

export const space = (n: number) => n * 4;

const monoStack =
  Platform.OS === 'ios'
    ? 'Menlo'
    : Platform.OS === 'android'
      ? 'monospace'
      : 'ui-monospace, SFMono-Regular, Menlo, monospace';

export const mono = monoStack;

export const softShadow = (opacity = 0.35, radius = 24) => ({
  shadowColor: '#000000',
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 12 },
  elevation: 8,
});

export const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return `rgba(255,255,255,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/** Iridescent ramp used by the shader-ish marks and glows. */
export const iridescent = (name: ThemeName) =>
  name === 'dark'
    ? ['#5EE7FF', '#A97BFF', '#FF77C4', '#5EE7FF']
    : ['#0B87B5', '#6B3BD6', '#D13C92', '#0B87B5'];
