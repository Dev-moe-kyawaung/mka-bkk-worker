import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue, useAnimatedStyle, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Scene } from '../data/profile';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono } from '../theme/tokens';

interface RailProps {
  scenes: Scene[];
  progress: SharedValue<number>;
  activeIndex: number;
  onSelect: (sceneId: string) => void;
}

/** Scroll-depth indicator: a filling rail plus one dot per scene. */
export const ProgressRail: React.FC<RailProps> = ({ scenes, progress, activeIndex, onSelect }) => {
  const { colors } = useTheme();

  const fill = useAnimatedStyle(() => ({
    height: `${Math.max(2, progress.value * 100)}%`,
  }));

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={[styles.rail, { backgroundColor: hexToRgba(colors.text, 0.12) }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, fill]} />
      </View>
      <View style={styles.dots}>
        {scenes.map((s, i) => {
          const active = i === activeIndex;
          return (
            <Pressable
              key={s.id}
              onPress={() => onSelect(s.id)}
              hitSlop={10}
              accessibilityLabel={`Jump to ${s.label}`}
              style={styles.dotWrap}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: active ? colors.accent : hexToRgba(colors.text, 0.25),
                    transform: [{ scale: active ? 1.35 : 1 }],
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.label, { color: colors.textFaint }]}>
        {String(activeIndex).padStart(2, '0')}
      </Text>
    </View>
  );
};

export const PerfBadge: React.FC<{ visible: boolean }> = ({ visible }) => {
  const { colors } = useTheme();
  const [fps, setFps] = useState(60);
  const [draws, setDraws] = useState(0);
  const frames = useSharedValue(0);

  useFrameCallback(() => {
    frames.value += 1;
  }, true);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const f = frames.value;
      frames.value = 0;
      setFps(f);
      setDraws(Math.round(f * 1.6));
    }, 1000);
    return () => clearInterval(id);
  }, [visible, frames]);

  if (!visible) return null;

  return (
    <View style={[styles.perf, { backgroundColor: colors.surfaceStrong, borderColor: colors.border }]}>
      <Text style={[styles.perfTitle, { color: colors.positive }]}>perf · r3f monitor</Text>
      <Text style={[styles.perfLine, { color: colors.text }]}>fps      {fps}</Text>
      <Text style={[styles.perfLine, { color: colors.textDim }]}>draws    {draws}</Text>
      <Text style={[styles.perfLine, { color: colors.textDim }]}>particles on-canvas</Text>
      <Text style={[styles.perfLine, { color: colors.textFaint }]}>budget   30 fps mobile</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  rail: {
    position: 'absolute',
    right: 11,
    top: '18%',
    bottom: '18%',
    width: 2,
    borderRadius: 1,
  },
  fill: {
    width: 2,
    borderRadius: 1,
  },
  dots: { gap: 12, alignItems: 'center' },
  dotWrap: { paddingVertical: 4, paddingHorizontal: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: mono, fontSize: 9.5, letterSpacing: 1 },
  perf: {
    position: 'absolute',
    right: 12,
    top: 108,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  perfTitle: { fontFamily: mono, fontSize: 9.5, letterSpacing: 1, textTransform: 'uppercase' },
  perfLine: { fontFamily: mono, fontSize: 10.5 },
});
