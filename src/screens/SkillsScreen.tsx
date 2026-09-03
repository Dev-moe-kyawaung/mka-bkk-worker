import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_HEIGHT } from '../components/TopNav';
import { SkillCard, SkillsGalaxy } from '../components/SkillsGalaxy';
import { Chip, EmptyState, SectionHeader } from '../components/ui';
import { Skill, skillCategories, skills } from '../data/skills';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono } from '../theme/tokens';
import { tap } from '../lib/haptics';
import { TabScreenProps } from '../navigation/types';

const SkillRow: React.FC<{ skill: Skill; width: number; onPress: () => void; active: boolean }> = ({
  skill,
  width,
  onPress,
  active,
}) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${skill.name}, proficiency ${skill.level}`}
      style={[
        styles.row,
        {
          width,
          backgroundColor: active ? hexToRgba(skill.color, 0.1) : colors.surface,
          borderColor: active ? hexToRgba(skill.color, 0.5) : colors.border,
        },
      ]}
    >
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.rowHead}>
          <Text style={[styles.rowName, { color: colors.text }]}>{skill.name}</Text>
          <Text style={[styles.rowLevel, { color: skill.color }]}>{skill.level}</Text>
        </View>
        <View style={[styles.track, { backgroundColor: hexToRgba(colors.text, 0.1) }]}>
          <View
            style={[
              styles.fill,
              { width: `${skill.level}%`, backgroundColor: skill.color },
            ]}
          />
        </View>
        <Text style={[styles.rowNote, { color: colors.textDim }]} numberOfLines={active ? undefined : 2}>
          {skill.note}
        </Text>
      </View>
      <Text style={[styles.rowYears, { color: colors.textFaint }]}>{skill.years}y</Text>
    </Pressable>
  );
};

export const SkillsScreen: React.FC<TabScreenProps<'Skills'>> = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentW = width - 32;

  const [filter, setFilter] = useState<string>('All');
  const [selected, setSelected] = useState<Skill | null>(null);

  const data = useMemo(
    () => (filter === 'All' ? skills : skills.filter((s) => s.category === filter)),
    [filter]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + NAV_HEIGHT }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, gap: 10 }}
        ListHeaderComponent={
          <View style={{ gap: 14, paddingBottom: 4 }}>
            <SectionHeader
              index="03"
              title="Skills galaxy"
              blurb={`${skills.length} nodes across ${skillCategories.length - 1} orbits. Tap a particle or a row for depth.`}
              accent={colors.accent3}
            />
            <SkillsGalaxy
              width={contentW}
              height={Math.min(contentW, 360)}
              skills={data}
              dimOthers={false}
              selectedId={selected?.id ?? null}
              onSelect={(s) => {
                tap();
                setSelected((prev) => (prev?.id === s.id ? null : s));
              }}
              accent={colors.accent3}
              dimColor={colors.textFaint}
            />
            <SkillCard skill={selected} onClear={() => setSelected(null)} width={contentW} />
            <FlatList
              horizontal
              data={[...skillCategories]}
              keyExtractor={(c) => c.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 20 }}
              renderItem={({ item }) => (
                <Chip
                  label={item.label}
                  color={item.color}
                  active={filter === item.id}
                  onPress={() => {
                    setFilter(item.id);
                    setSelected(null);
                  }}
                />
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="planet-outline"
            title="Empty orbit"
            body="That category has no skills attached yet."
            actionLabel="Show all skills"
            onAction={() => setFilter('All')}
          />
        }
        renderItem={({ item }) => (
          <SkillRow
            skill={item}
            width={contentW}
            active={selected?.id === item.id}
            onPress={() => {
              tap();
              setSelected((prev) => (prev?.id === item.id ? null : item));
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowName: { fontSize: 14.5, fontWeight: '800', letterSpacing: -0.2 },
  rowLevel: { fontSize: 12.5, fontWeight: '800', fontFamily: mono },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  rowNote: { fontSize: 12, lineHeight: 17 },
  rowYears: { fontSize: 11, fontFamily: mono },
});
