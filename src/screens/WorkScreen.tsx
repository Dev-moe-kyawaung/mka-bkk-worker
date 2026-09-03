import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Chip, EmptyState, LoadingRow, SectionHeader } from '../components/ui';
import { NAV_HEIGHT } from '../components/TopNav';
import { projectCategories, Project, projects } from '../data/projects';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono, softShadow } from '../theme/tokens';
import { TabScreenProps } from '../navigation/types';
import { tap } from '../lib/haptics';

type Sort = 'recent' | 'impact';

const IMPACT_ORDER = ['kestrel', 'lumen', 'nimbus', 'verity', 'atlas', 'orbit'];

const ProjectCard: React.FC<{
  project: Project;
  width: number;
  onOpen: (project: Project) => void;
}> = ({ project, width, onOpen }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onOpen(project);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open ${project.name} case study`}
      style={({ pressed }) => [
        styles.card,
        {
          width,
          backgroundColor: colors.surfaceStrong,
          borderColor: hexToRgba(project.accent, pressed ? 0.55 : 0.22),
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: project.accent }]} />
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardName, { color: colors.text }]}>{project.name}</Text>
          <Text style={[styles.cardMeta, { color: colors.textFaint }]}>
            {project.client} · {project.year} · {project.duration}
          </Text>
        </View>
        <View style={[styles.badge, { borderColor: hexToRgba(project.accent, 0.4) }]}>
          <Text style={[styles.badgeText, { color: project.accent }]}>{project.category}</Text>
        </View>
      </View>

      <Text style={[styles.tagline, { color: colors.textDim }]}>{project.tagline}</Text>

      <View style={styles.chipRow}>
        {project.stack.slice(0, 4).map((s) => (
          <View key={s} style={[styles.miniChip, { borderColor: colors.border }]}>
            <Text style={[styles.miniChipText, { color: colors.textDim }]}>{s}</Text>
          </View>
        ))}
        {project.stack.length > 4 ? (
          <Text style={[styles.more, { color: colors.textFaint }]}>+{project.stack.length - 4}</Text>
        ) : null}
      </View>

      <View style={styles.wins}>
        <Ionicons name="trending-up" size={13} color={project.accent} />
        <Text style={[styles.winText, { color: colors.text }]} numberOfLines={2}>
          {project.results[0]}
        </Text>
      </View>

      <View style={styles.cardFoot}>
        <View style={styles.footPill}>
          <Ionicons name="phone-portrait-outline" size={11} color={colors.textFaint} />
          <Text style={[styles.footText, { color: colors.textFaint }]}>{project.platforms[0]}</Text>
        </View>
        <View style={styles.footPill}>
          <Ionicons name="people-outline" size={11} color={colors.textFaint} />
          <Text style={[styles.footText, { color: colors.textFaint }]}>{project.team}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Ionicons name="arrow-forward-circle" size={20} color={project.accent} />
      </View>
    </Pressable>
  );
};

export const WorkScreen: React.FC<TabScreenProps<'Work'>> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentW = width - 32;

  const [filter, setFilter] = useState<string>(route.params?.filter ?? 'All');
  const [sort, setSort] = useState<Sort>('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncedAt, setSyncedAt] = useState(() => new Date());

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 620);
    return () => clearTimeout(id);
  }, []);

  const data = useMemo(() => {
    const byFilter = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
    if (sort === 'recent') return byFilter;
    return [...byFilter].sort(
      (a, b) => IMPACT_ORDER.indexOf(a.id) - IMPACT_ORDER.indexOf(b.id)
    );
  }, [filter, sort]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setSyncedAt(new Date());
      setRefreshing(false);
    }, 900);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg, paddingTop: insets.top + NAV_HEIGHT }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, gap: 14 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        ListHeaderComponent={
          <View style={{ paddingBottom: 6 }}>
            <SectionHeader
              index="02"
              title="The work"
              blurb={`${projects.length} case studies · last synced ${syncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              accent={colors.accent2}
              right={
                <Pressable
                  onPress={() => setSort((s) => (s === 'recent' ? 'impact' : 'recent'))}
                  style={[styles.sortBtn, { borderColor: colors.border }]}
                  accessibilityRole="button"
                >
                  <Ionicons name="swap-vertical-outline" size={12} color={colors.accent2} />
                  <Text style={[styles.sortText, { color: colors.accent2 }]}>
                    {sort === 'recent' ? 'by year' : 'by impact'}
                  </Text>
                </Pressable>
              }
            />
            <FlatList
              horizontal
              data={[...projectCategories]}
              keyExtractor={(c) => c}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 20 }}
              renderItem={({ item }) => (
                <Chip label={item} active={filter === item} onPress={() => setFilter(item)} />
              )}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="file-tray-outline"
            title="Nothing in this orbit"
            body="No projects filed under that category yet. Reset the filter to see everything."
            actionLabel="Show all work"
            onAction={() => setFilter('All')}
          />
        }
        ListFooterComponent={
          loading ? (
            <LoadingRow label="Fetching release manifests…" />
          ) : (
            <Text style={[styles.footer, { color: colors.textFaint }]}>
              Every project above shipped to a real store. Numbers are post-launch measurements.
            </Text>
          )
        }
        renderItem={({ item }) => <ProjectCard project={item} width={contentW} onOpen={(p) => navigation.navigate('CaseStudy', { id: p.id })} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
    ...softShadow(0.3, 18),
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardName: { fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  cardMeta: { fontSize: 10.5, fontFamily: mono, marginTop: 3 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  tagline: { fontSize: 13.5, lineHeight: 20 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  miniChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  miniChipText: { fontSize: 10, fontFamily: mono },
  more: { fontSize: 10, fontFamily: mono },
  wins: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
  },
  winText: { flex: 1, fontSize: 12.5, lineHeight: 17, fontWeight: '600' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  footPill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footText: { fontSize: 10.5, fontFamily: mono },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sortText: { fontSize: 10.5, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, lineHeight: 17, marginTop: 18, paddingHorizontal: 20 },
});
