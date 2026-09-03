import { useCallback, useRef, useState } from 'react';
import { SharedValue, runOnJS, useAnimatedReaction, useFrameCallback, useSharedValue } from 'react-native-reanimated';

export const clamp01 = (v: number) => {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
};

export const easeOutCubic = (t: number) => {
  'worklet';
  const p = clamp01(t);
  return 1 - Math.pow(1 - p, 3);
};

export const easeInOutCubic = (t: number) => {
  'worklet';
  const p = clamp01(t);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
};

/** Maps a 0..1 scene progress into a 0..1 sub-window — a scrubbed ScrollTrigger range. */
export const window01 = (p: number, from: number, to: number) => {
  'worklet';
  if (to === from) return p >= to ? 1 : 0;
  return clamp01((p - from) / (to - from));
};

/**
 * Progress of a scene through the viewport: 0 when the scene top reaches the bottom
 * of the viewport, 1 once the scene bottom has passed the top.
 */
export const sceneProgress = (
  scrollY: SharedValue<number>,
  y: number,
  h: number,
  viewport: number
) => {
  'worklet';
  const start = y - viewport;
  const span = Math.max(h + viewport, 1);
  return clamp01((scrollY.value - start) / span);
};

/** Free-running clock in seconds. */
export function useClock() {
  const t = useSharedValue(0);
  useFrameCallback((info) => {
    t.value += (info.timeSincePreviousFrame ?? 16) / 1000;
  }, true);
  return t;
}

/**
 * Scroll-scrubbed count-up. The number only re-renders when the rounded value changes.
 */
export function useScrubCounter(
  target: number,
  progress: SharedValue<number>,
  from: number,
  to: number,
  decimals = 0
) {
  const [display, setDisplay] = useState(0);
  const last = useRef(-1);

  const apply = useCallback((v: number) => {
    if (last.current !== v) {
      last.current = v;
      setDisplay(v);
    }
  }, []);

  useAnimatedReaction(
    () => {
      const scaled = target * easeOutCubic(window01(progress.value, from, to));
      return decimals > 0 ? Math.round(scaled * 10) / 10 : Math.round(scaled);
    },
    (value) => {
      'worklet';
      runOnJS(apply)(value);
    },
    [target, from, to, decimals, apply]
  );

  return decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));
}
