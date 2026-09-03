import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { Skill } from '../data/skills';
import { useClock } from '../lib/anim';
import { hexToRgba, mono } from '../theme/tokens';

interface Point {
  skill: Skill;
  x: number;
  y: number;
  z: number;
}

const buildSphere = (list: Skill[]): Point[] => {
  const n = list.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return list.map((skill, i) => {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const jitter = 0.84 + (((i * 37) % 21) / 100);
    return {
      skill,
      x: Math.cos(theta) * radiusAtY * jitter,
      y: y * 0.94,
      z: Math.sin(theta) * radiusAtY * jitter,
    };
  });
};

interface ParticleProps {
  p: Point;
  t: SharedValue<number>;
  cx: number;
  cy: number;
  radius: number;
  dimmed: boolean;
  selected: boolean;
  onPress: (skill: Skill) => void;
  base: number;
}

const Particle: React.FC<ParticleProps> = ({ p, t, cx, cy, radius, dimmed, selected, onPress, base }) => {
  const dim = useSharedValue(dimmed ? 1 : 0);
  const sel = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    dim.value = withTiming(dimmed ? 1 : 0, { duration: 320 });
  }, [dimmed, dim]);

  useEffect(() => {
    sel.value = withTiming(selected ? 1 : 0, { duration: 260 });
  }, [selected, sel]);

  const press = useCallback(() => onPress(p.skill), [onPress, p.skill]);

  const style = useAnimatedStyle(() => {
    const ry = t.value * 0.24;
    const rx = 0.36 + Math.sin(t.value * 0.12) * 0.14;

    const cosY = Math.cos(ry);
    const sinY = Math.sin(ry);
    const x1 = p.x * cosY - p.z * sinY;
    const z1 = p.x * sinY + p.z * cosY;

    const cosX = Math.cos(rx);
    const sinX = Math.sin(rx);
    const y2 = p.y * cosX - z1 * sinX;
    const z2 = p.y * sinX + z1 * cosX;

    const fov = 2.4;
    const persp = fov / (fov + z2);
    const px = cx + x1 * radius * persp;
    const py = cy + y2 * radius * persp;
    const depth = (z2 + 1) / 2;

    const pulse = sel.value > 0 ? 1 + 0.16 * Math.sin(t.value * 3.4) : 1;
    const scale = ((5 + (p.skill.level / 100) * 12) / base) * persp * (1 + sel.value * 0.5) * pulse;
    const opacity =
      (0.22 + depth * 0.78) * (1 - dim.value * 0.82) * (0.55 + (p.skill.level / 100) * 0.45);

    return {
      opacity,
      zIndex: Math.round(depth * 100) + (selected ? 50 : 0),
      transform: [
        { translateX: px - cx },
        { translateY: py - cy },
        { scale },
        { rotate: `${Math.sin(t.value * 0.5 + p.x * 4) * 8}deg` },
      ],
    };
  });

  const halo = useAnimatedStyle(() => ({
    opacity: sel.value * (0.55 + 0.45 * Math.sin(t.value * 3.4)),
    transform: [{ scale: 1 + sel.value * 0.55 }],
  }));

  return (
    <Animated.View style={[styles.particle, style]}>
      <Pressable onPress={press} hitSlop={12} accessibilityLabel={`${p.skill.name} skill`}>
        <View style={[styles.dot, { width: base, height: base, borderRadius: base / 2, backgroundColor: p.skill.color }]} />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              width: base * 2.6,
              height: base * 2.6,
              borderRadius: base * 1.3,
              borderColor: p.skill.color,
            },
            halo,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
};

interface GalaxyProps {
  width: number;
  height: number;
  skills: Skill[];
  dimOthers: boolean;
  selectedId: string | null;
  onSelect: (skill: Skill) => void;
  accent: string;
  dimColor: string;
}

export const SkillsGalaxy: React.FC<GalaxyProps> = ({
  width,
  height,
  skills,
  dimOthers,
  selectedId,
  onSelect,
  accent,
  dimColor,
}) => {
  const t = useClock();
  const cx = width / 2;
  const cy = height / 2 - 6;
  const radius = Math.min(width, height) * 0.36;
  const base = 14;
  const points = useMemo(() => buildSphere(skills), [skills]);

  return (
    <View style={{ width, height }}>
      <View pointerEvents="none" style={[styles.core, { width: radius * 2.2, height: radius * 2.2, borderRadius: radius }]} />
      <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
        <Ellipse
          cx={cx}
          cy={cy}
          rx={radius * 1.06}
          ry={radius * 0.34}
          stroke={hexToRgba(accent, 0.22)}
          strokeWidth={1}
          fill="none"
        />
        <Ellipse
          cx={cx}
          cy={cy}
          rx={radius * 0.55}
          ry={radius * 1.02}
          stroke={hexToRgba(accent, 0.14)}
          strokeWidth={1}
          fill="none"
        />
        <Circle cx={cx} cy={cy} r={radius * 1.02} stroke={hexToRgba(accent, 0.1)} strokeWidth={1} fill="none" />
      </Svg>

      {points.map((p) => (
        <Particle
          key={p.skill.id}
          p={p}
          t={t}
          cx={cx}
          cy={cy}
          radius={radius}
          base={base}
          dimmed={dimOthers}
          selected={selectedId === p.skill.id}
          onPress={onSelect}
        />
      ))}

      <Text pointerEvents="none" style={[styles.counter, { color: dimColor }]}>
        {points.length} nodes · tap a particle
      </Text>
    </View>
  );
};

export const SkillCard: React.FC<{
  skill: Skill | null;
  onClear: () => void;
  width: number;
}> = ({ skill, onClear, width }) => {
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.value = withTiming(skill ? 1 : 0, { duration: 280 });
  }, [skill, shown]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 18 }],
  }));

  if (!skill) return null;

  const r = 22;
  const circumference = 2 * Math.PI * r;

  return (
    <Animated.View style={[styles.card, { width: Math.min(width, 420) }, style]}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, { color: skill.color }]}>{skill.name}</Text>
          <Text style={styles.cardMeta}>
            {skill.category} · {skill.years} yrs
          </Text>
        </View>
        <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={60} height={60} style={StyleSheet.absoluteFill}>
            <Circle cx={30} cy={30} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={5} fill="none" />
            <Circle
              cx={30}
              cy={30}
              r={r}
              stroke={skill.color}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(skill.level / 100) * circumference} ${circumference}`}
              transform="rotate(-90 30 30)"
            />
          </Svg>
          <Text style={[styles.cardLevel, { color: skill.color }]}>{skill.level}</Text>
        </View>
        <Pressable onPress={onClear} hitSlop={12} accessibilityLabel="Close skill detail">
          <Text style={styles.cardClose}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.cardNote}>{skill.note}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    left: -6,
    top: -6,
    borderWidth: 1.5,
  },
  core: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: 0,
    transform: [{ translateY: -110 }],
    backgroundColor: 'rgba(120,140,255,0.07)',
  },
  counter: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: mono,
  },
  card: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(14,17,34,0.92)',
    gap: 10,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardName: { fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  cardMeta: { color: '#98A1C4', fontSize: 11.5, marginTop: 2, fontFamily: mono },
  cardLevel: { fontSize: 12, fontWeight: '800', fontFamily: mono },
  cardClose: { color: '#98A1C4', fontSize: 14, paddingHorizontal: 6 },
  cardNote: { color: '#C3CAE6', fontSize: 13, lineHeight: 19 },
});
