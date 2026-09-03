import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { ArchLayer, archLayers } from '../data/architecture';
import { easeInOutCubic, window01 } from '../lib/anim';
import { hexToRgba, mono } from '../theme/tokens';

/**
 * Slabs separate along the vertical axis as the scene scrolls — an exploded view
 * of clean architecture, driven by a scrubbed progress value.
 */
interface StackProps {
  width: number;
  progress: SharedValue<number>;
  selectedId: string | null;
  onSelect: (layer: ArchLayer) => void;
}

export const ArchitectureStack: React.FC<StackProps> = ({ width, progress, selectedId, onSelect }) => {
  const plateW = Math.min(width * 0.58, 230);
  const plateH = plateW * 0.42;
  const height = archLayers.length * 72 + 96;

  return (
    <View style={{ width }}>
      <View style={{ width, height }}>
        {archLayers.map((layer, i) => (
          <LayerSlab
            key={layer.id}
            layer={layer}
            index={i}
            total={archLayers.length}
            progress={progress}
            plateW={plateW}
            plateH={plateH}
            containerHeight={height}
            selected={selectedId === layer.id}
            onSelect={onSelect}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {archLayers.map((layer, i) => (
          <Pressable
            key={layer.id}
            onPress={() => onSelect(layer)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedId === layer.id }}
            style={({ pressed }) => [
              styles.legendRow,
              {
                borderColor:
                  selectedId === layer.id ? hexToRgba(layer.color, 0.6) : 'transparent',
                backgroundColor:
                  selectedId === layer.id ? hexToRgba(layer.color, 0.1) : 'transparent',
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: layer.color }]} />
            <Text style={[styles.legendIndex, { color: layer.color }]}>0{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.legendName, { color: layer.color }]}>{layer.name}</Text>
              <Text style={styles.legendTech} numberOfLines={2}>
                {layer.tech}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

interface SlabProps {
  layer: ArchLayer;
  index: number;
  total: number;
  progress: SharedValue<number>;
  plateW: number;
  plateH: number;
  containerHeight: number;
  selected: boolean;
  onSelect: (layer: ArchLayer) => void;
}

const LayerSlab: React.FC<SlabProps> = ({
  layer,
  index,
  total,
  progress,
  plateW,
  plateH,
  containerHeight,
  selected,
  onSelect,
}) => {
  const press = React.useCallback(() => onSelect(layer), [onSelect, layer]);

  const style = useAnimatedStyle(() => {
    const p = easeInOutCubic(window01(progress.value, 0.12, 0.62));
    const gap = 14 + p * 58;
    const centre = containerHeight / 2 - 22;
    const y = centre + (index - (total - 1) / 2) * gap;
    return {
      transform: [
        { perspective: 900 },
        { translateY: y + (1 - p) * 8 },
        { rotateX: `${58 - p * 6}deg` },
        { rotateZ: `${-16 + p * 10 + index * 1.5}deg` },
        { scale: 0.94 + p * 0.06 },
      ],
      opacity: 0.5 + p * 0.5,
    };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: selected ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.slab, style]}>
      <Pressable onPress={press} accessibilityLabel={`${layer.name} layer`}>
        <View
          style={[
            styles.plate,
            {
              width: plateW,
              height: plateH,
              backgroundColor: hexToRgba(layer.color, selected ? 0.24 : 0.1),
              borderColor: hexToRgba(layer.color, selected ? 1 : 0.5),
            },
          ]}
        >
          <View
            style={[
              styles.plateEdge,
              {
                width: plateW - 14,
                backgroundColor: hexToRgba(layer.color, selected ? 0.55 : 0.26),
              },
            ]}
          />
          <Text style={[styles.plateTag, { color: layer.color }]}>{layer.short}</Text>
          <Animated.View
            pointerEvents="none"
            style={[styles.plateGlow, { borderColor: hexToRgba(layer.color, 0.8) }, glowStyle]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export const ArchitectureDetail: React.FC<{
  layer: ArchLayer | null;
  width: number;
  onClear: () => void;
}> = ({ layer, width, onClear }) => {
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.value = withTiming(layer ? 1 : 0, { duration: 260 });
  }, [layer, shown]);

  const style = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ translateY: (1 - shown.value) * 14 }],
  }));

  if (!layer) return null;

  return (
    <Animated.View style={[styles.detailCard, { width: Math.min(width, 460) }, style]}>
      <View style={styles.detailHead}>
        <View style={[styles.swatch, { backgroundColor: layer.color }]} />
        <Text style={[styles.detailName, { color: layer.color }]}>{layer.name}</Text>
        <Pressable onPress={onClear} hitSlop={12} accessibilityLabel="Close layer detail">
          <Text style={styles.cardClose}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.detailRule}>{layer.rule}</Text>
      {layer.modules.map((m) => (
        <View key={m.name} style={styles.moduleRow}>
          <Text style={[styles.moduleName, { color: layer.color }]}>{m.name}</Text>
          <Text style={styles.moduleDetail}>{m.detail}</Text>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  slab: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  plate: {
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateEdge: {
    position: 'absolute',
    bottom: -8,
    left: 7,
    height: 8,
    borderRadius: 4,
  },
  plateGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  plateTag: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 4,
  },
  legend: {
    marginTop: 18,
    gap: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  legendIndex: { fontFamily: mono, fontSize: 10.5, width: 20 },
  legendName: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.3 },
  legendTech: { color: '#98A1C4', fontSize: 11, marginTop: 2, fontFamily: mono },
  detailCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(14,17,34,0.92)',
    gap: 10,
  },
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailName: { flex: 1, fontSize: 17, fontWeight: '800' },
  cardClose: { color: '#98A1C4', fontSize: 14, paddingHorizontal: 6 },
  detailRule: { color: '#C3CAE6', fontSize: 12.5, lineHeight: 18 },
  moduleName: { fontSize: 10.5, fontWeight: '700', fontFamily: mono },
  moduleRow: { gap: 2 },
  moduleDetail: { color: '#98A1C4', fontSize: 12.5, lineHeight: 17 },
});
