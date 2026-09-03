import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useClock } from '../lib/anim';
import { hexToRgba } from '../theme/tokens';

interface Particle {
  i: number;
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  depth: number;
  twinkle: number;
  phase: number;
  glow: boolean;
}

/** Deterministic PRNG so the field never re-shuffles on re-render. */
const mulberry = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const buildField = (count: number, seed: number): Particle[] => {
  const rnd = mulberry(seed);
  return Array.from({ length: count }, (_, i) => {
    const depth = rnd();
    return {
      i,
      x: rnd(),
      y: rnd(),
      size: 1 + depth * 2.4,
      alpha: 0.22 + rnd() * 0.62,
      speed: 0.02 + depth * 0.085,
      depth,
      twinkle: 0.5 + rnd() * 1.8,
      phase: rnd() * Math.PI * 2,
      glow: depth > 0.87,
    };
  });
};

interface StarProps {
  p: Particle;
  t: SharedValue<number>;
  width: number;
  height: number;
  color: string;
  scrollY?: SharedValue<number>;
  parallax: number;
}

const Star: React.FC<StarProps> = ({ p, t, width, height, color, scrollY, parallax }) => {
  const travel = height + 80;

  const style = useAnimatedStyle(() => {
    const drift = (t.value * p.speed * 24) % travel;
    let baseY = p.y * travel - drift;
    if (baseY < -40) baseY += travel;
    const par = scrollY ? scrollY.value * p.depth * parallax : 0;
    const wobble = Math.sin(t.value * 0.35 + p.phase) * 5 * p.depth;
    const flicker = 0.55 + 0.45 * Math.sin(t.value * p.twinkle + p.phase);
    return {
      opacity: p.alpha * flicker,
      transform: [{ translateX: p.x * width + wobble }, { translateY: baseY + par }],
    };
  });

  const size = p.glow ? p.size * 6 : p.size;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, style]}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: p.glow ? hexToRgba(color, 0.18) : color,
        }}
      />
      {p.glow ? (
        <View
          style={{
            position: 'absolute',
            left: size / 2 - 1,
            top: size / 2 - 1,
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: color,
          }}
        />
      ) : null}
    </Animated.View>
  );
};

export interface StarfieldProps {
  count?: number;
  seed?: number;
  color: string;
  accent?: string;
  width: number;
  height: number;
  scrollY?: SharedValue<number>;
  parallax?: number;
}

export const Starfield: React.FC<StarfieldProps> = ({
  count = 70,
  seed = 7,
  color,
  accent,
  width,
  height,
  scrollY,
  parallax = 0.25,
}) => {
  const t = useClock();
  const particles = useMemo(() => buildField(count, seed), [count, seed]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {particles.map((p) => (
        <Star
          key={p.i}
          p={p}
          t={t}
          width={width}
          height={height}
          color={accent && p.glow ? accent : color}
          scrollY={scrollY}
          parallax={parallax}
        />
      ))}
    </View>
  );
};

export const StaticStarfield: React.FC<{
  count?: number;
  color: string;
  width: number;
  height: number;
  seed?: number;
}> = ({ count = 40, color, width, height, seed = 31 }) => {
  const particles = useMemo(() => buildField(count, seed), [count, seed]);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      {particles.map((p) => (
        <View
          key={p.i}
          style={{
            position: 'absolute',
            left: p.x * width,
            top: p.y * height,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            opacity: p.alpha,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
};

export const starfieldTint = hexToRgba('#FFFFFF', 1);
