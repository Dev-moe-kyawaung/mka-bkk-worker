import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { LinkItem } from '../data/profile';
import { easeOutCubic, window01 } from '../lib/anim';
import { hexToRgba, mono } from '../theme/tokens';

const AnimatedLine = Animated.createAnimatedComponent(Line);

type Pt = [number, number];

const NODES: Record<string, Pt> = {
  top: [0.5, 0.05],
  left: [0.06, 0.34],
  right: [0.94, 0.34],
  bottom: [0.5, 0.95],
  north: [0.5, 0.3],
  centre: [0.5, 0.5],
  west: [0.18, 0.56],
  east: [0.82, 0.56],
  south: [0.5, 0.74],
};

const SEGMENTS: [string, string][] = [
  ['top', 'north'],
  ['left', 'west'],
  ['right', 'east'],
  ['bottom', 'south'],
  ['north', 'centre'],
  ['west', 'centre'],
  ['east', 'centre'],
  ['south', 'centre'],
  ['north', 'west'],
  ['north', 'east'],
  ['south', 'west'],
  ['south', 'east'],
];

const LINK_NODES: { key: string; linkIndex: number }[] = [
  { key: 'top', linkIndex: 0 },
  { key: 'left', linkIndex: 1 },
  { key: 'right', linkIndex: 2 },
  { key: 'bottom', linkIndex: 3 },
];

const Segment: React.FC<{
  from: Pt;
  to: Pt;
  width: number;
  height: number;
  progress: SharedValue<number>;
  start: number;
  color: string;
}> = ({ from, to, width, height, progress, start, color }) => {
  const x1 = from[0] * width;
  const y1 = from[1] * height;
  const x2 = to[0] * width;
  const y2 = to[1] * height;

  const props = useAnimatedProps(() => {
    const p = easeOutCubic(window01(progress.value, start, start + 0.26));
    return {
      x2: x1 + (x2 - x1) * p,
      y2: y1 + (y2 - y1) * p,
    };
  });

  return (
    <AnimatedLine
      x1={x1}
      y1={y1}
      x2={x1}
      y2={y1}
      stroke={color}
      strokeWidth={1.3}
      strokeLinecap="round"
      animatedProps={props}
    />
  );
};

interface ConstellationProps {
  width: number;
  height: number;
  progress: SharedValue<number>;
  links: LinkItem[];
  onOpen: (link: LinkItem) => void;
  accent: string;
  lineColor: string;
  starColor: string;
}

export const ContactConstellation: React.FC<ConstellationProps> = ({
  width,
  height,
  progress,
  links,
  onOpen,
  accent,
  lineColor,
  starColor,
}) => {
  return (
    <View style={{ width, height }}>
      <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
        {SEGMENTS.map(([a, b], i) => (
          <Segment
            key={`${a}-${b}`}
            from={NODES[a]}
            to={NODES[b]}
            width={width}
            height={height}
            progress={progress}
            start={0.06 + i * 0.055}
            color={i < 4 ? hexToRgba(accent, 0.55) : lineColor}
          />
        ))}
        {Object.entries(NODES).map(([key, pt], i) => (
          <Circle
            key={key}
            cx={pt[0] * width}
            cy={pt[1] * height}
            r={key === 'centre' ? 3 : 2}
            fill={key === 'centre' ? accent : starColor}
            opacity={0.75}
          />
        ))}
      </Svg>

      {LINK_NODES.map(({ key, linkIndex }, i) => {
        const link = links[linkIndex];
        if (!link) return null;
        return (
          <ConstellationNode
            key={key}
            pt={NODES[key]}
            width={width}
            height={height}
            link={link}
            progress={progress}
            start={0.1 + i * 0.14}
            onOpen={onOpen}
          />
        );
      })}

      <View pointerEvents="none" style={[styles.caption, { bottom: -4 }]}>
        <Text style={[styles.captionText, { color: starColor }]}>
          {Object.keys(NODES).length} stars · {SEGMENTS.length} links · scroll to draw
        </Text>
      </View>
    </View>
  );
};

const ConstellationNode: React.FC<{
  pt: Pt;
  width: number;
  height: number;
  link: LinkItem;
  progress: SharedValue<number>;
  start: number;
  onOpen: (link: LinkItem) => void;
}> = ({ pt, width, height, link, progress, start, onOpen }) => {
  const shown = useSharedValue(0);

  useEffect(() => {
    shown.value = withTiming(1, { duration: 420 });
  }, [shown]);

  const style = useAnimatedStyle(() => {
    const p = easeOutCubic(window01(progress.value, start, start + 0.16));
    return {
      opacity: p,
      transform: [{ scale: 0.6 + p * 0.4 }],
    };
  });

  const press = () => onOpen(link);

  const left = pt[0] * width - 46;
  const top = pt[1] * height - 46;

  return (
    <Animated.View style={[styles.node, { left, top }, style]}>
      <Pressable onPress={press} style={styles.nodeButton} accessibilityLabel={`Open ${link.label}`}>
        <View style={[styles.nodeRing, { borderColor: hexToRgba(link.color, 0.6) }]}>
          <View style={[styles.nodeCore, { backgroundColor: hexToRgba(link.color, 0.16) }]}>
            <Ionicons name={link.icon} size={18} color={link.color} />
          </View>
        </View>
        <Text style={[styles.nodeLabel, { color: link.color }]}>{link.label}</Text>
        <Text style={styles.nodeHandle} numberOfLines={1}>
          {link.handle}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    width: 92,
    alignItems: 'center',
  },
  nodeButton: {
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  nodeRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  nodeCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  nodeHandle: { color: '#98A1C4', fontSize: 9.5, fontFamily: mono, maxWidth: 88 },
  caption: {
    position: 'absolute',
    alignSelf: 'center',
  },
  captionText: {
    fontSize: 9.5,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    fontFamily: mono,
  },
});

export const openLink = async (href: string) => {
  try {
    await Linking.openURL(href);
  } catch {
    /* no-op: external handler unavailable */
  }
};
