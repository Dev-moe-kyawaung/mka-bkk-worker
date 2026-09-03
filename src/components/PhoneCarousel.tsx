import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Project } from '../data/projects';
import { hexToRgba, mono } from '../theme/tokens';
import { PhoneMockup } from './PhoneMockup';

interface CarouselProps {
  projects: Project[];
  width: number;
  onOpen: (project: Project) => void;
  onActiveChange?: (index: number) => void;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

const CarouselItem: React.FC<{
  project: Project;
  index: number;
  scrollX: SharedValue<number>;
  spacing: number;
  phoneWidth: number;
  onOpen: (project: Project) => void;
}> = ({ project, index, scrollX, spacing, phoneWidth, onOpen }) => {
  const open = useCallback(() => onOpen(project), [onOpen, project]);

  const style = useAnimatedStyle(() => {
    const d = index - scrollX.value;
    const abs = Math.abs(d);
    const depth = clamp(d, -2.4, 2.4);
    const scale = 1 - Math.min(abs, 2) * 0.11;
    return {
      opacity: 1 - Math.min(abs, 2.4) * 0.32,
      zIndex: Math.round(100 - abs * 10),
      transform: [
        { perspective: 1100 },
        { translateX: depth * spacing },
        { rotateY: `${clamp(-depth * 34, -62, 62)}deg` },
        { rotateX: `${clamp(abs * 3, 0, 7)}deg` },
        { scale },
        { translateY: Math.min(abs, 2) * 10 },
      ],
    };
  });

  const captionStyle = useAnimatedStyle(() => {
    const abs = Math.abs(index - scrollX.value);
    return { opacity: 1 - Math.min(abs, 1.4) * 0.75 };
  });

  return (
    <Animated.View style={[styles.item, style]}>
      <Pressable onPress={open} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Open ${project.name} case study`}>
        <PhoneMockup project={project} width={phoneWidth} />
        <Animated.View style={[styles.caption, captionStyle]}>
          <Text style={[styles.captionName, { color: project.accent }]}>{project.name}</Text>
          <Text style={styles.captionMeta}>
            {project.category} · {project.year}
          </Text>
          <View style={[styles.openPill, { borderColor: hexToRgba(project.accent, 0.5) }]}>
            <Ionicons name="expand-outline" size={11} color={project.accent} />
            <Text style={[styles.openText, { color: project.accent }]}>Open case study</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const Dot: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
  <View
    style={[
      styles.dot,
      active && { backgroundColor: color, width: 18 },
    ]}
  />
);

export const PhoneCarousel: React.FC<CarouselProps> = ({
  projects,
  width,
  onOpen,
  onActiveChange,
}) => {
  const scrollX = useSharedValue(0);
  const active = useSharedValue(0);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const phoneWidth = Math.min(width * 0.58, 210);
  const spacing = width * 0.66;

  const setActive = useCallback(
    (i: number) => {
      setActiveIndex(i);
      onActiveChange?.(i);
    },
    [onActiveChange]
  );

  const onScroll = useAnimatedScrollHandler((e) => {
    const pos = e.contentOffset.x / width;
    scrollX.value = pos;
    const rounded = Math.round(pos);
    if (active.value !== rounded) {
      active.value = rounded;
      runOnJS(setActive)(rounded);
    }
  });

  const page = width;

  return (
    <View style={{ height: phoneWidth * 2.02 + 118 }}>
      <View style={styles.stage}>
        <View
          style={[
            styles.stageGlow,
            {
              width: width * 0.9,
              height: width * 0.9,
              borderRadius: width * 0.45,
            },
          ]}
        />
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={page}
          contentContainerStyle={{ width: page * projects.length }}
          style={{ width: page }}
        >
          {projects.map((p, i) => (
            <View key={p.id} style={{ width: page, alignItems: 'center' }}>
              <View style={{ width: phoneWidth, marginTop: 6 }}>
                <CarouselItem
                  project={p}
                  index={i}
                  scrollX={scrollX}
                  spacing={spacing}
                  phoneWidth={phoneWidth}
                  onOpen={onOpen}
                />
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      </View>

      <View style={styles.dots}>
        {projects.map((p, i) => (
          <Dot key={p.id} active={i === activeIndex} color={p.accent} />
        ))}
      </View>
      <Text style={styles.hint}>swipe the deck · tap a device to open the dossier</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(120,140,255,0.06)',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    alignItems: 'center',
    marginTop: 14,
    gap: 2,
  },
  captionName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  captionMeta: {
    color: '#98A1C4',
    fontSize: 11,
    fontFamily: mono,
  },
  openPill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  openText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.2 },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.38)',
    fontSize: 10,
    letterSpacing: 0.4,
    marginTop: 10,
    textTransform: 'uppercase',
  },
});
