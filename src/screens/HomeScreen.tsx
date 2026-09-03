import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSharedValue, useAnimatedScrollHandler, useDerivedValue, useFrameCallback, runOnJS, SharedValue } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArchitectureDetail, ArchitectureStack } from '../components/ArchitectureStack';
import { ContactConstellation, openLink } from '../components/Constellation';
import { LogoCluster } from '../components/Marks';
import { Markdown, MermaidDiagram } from '../components/Markdown';
import { PhoneCarousel } from '../components/PhoneCarousel';
import { PerfBadge, ProgressRail } from '../components/ProgressRail';
import { SkillsGalaxy, SkillCard } from '../components/SkillsGalaxy';
import { Starfield } from '../components/Starfield';
import { NAV_HEIGHT, TopNav } from '../components/TopNav';
import { Chip, GlassCard, SectionHeader } from '../components/ui';
import { archLayers, archMermaid, archPrinciples } from '../data/architecture';
import { links, metrics, profile, scenes } from '../data/profile';
import { projects, Project } from '../data/projects';
import { Skill, skillCategories, skills } from '../data/skills';
import { clamp01, sceneProgress, useScrubCounter } from '../lib/anim';
import { downloadResume } from '../lib/resume';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono, softShadow } from '../theme/tokens';
import { TabScreenProps } from '../navigation/types';

interface Layout {
  y: number;
  h: number;
}

const MetricCard: React.FC<{
  value: number;
  suffix: string;
  label: string;
  note: string;
  progress: SharedValue<number>;
  color: string;
  width: number;
}> = ({ value, suffix, label, note, progress, color, width }) => {
  const decimals = value % 1 !== 0 ? 1 : 0;
  const display = useScrubCounter(value, progress, 0.3, 0.62, decimals);
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.metric,
        {
          width: (width - 12) / 2,
          borderColor: hexToRgba(color, 0.22),
          backgroundColor: colors.surface,
        },
      ]}
    >
      <Text style={[styles.metricValue, { color }]}>
        {display}
        <Text style={[styles.metricSuffix, { color: hexToRgba(color, 0.7) }]}>{suffix}</Text>
      </Text>
      <Text style={[styles.metricLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.metricNote, { color: colors.textFaint }]}>{note}</Text>
    </View>
  );
};

export const HomeScreen: React.FC<TabScreenProps<'Reel'>> = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [viewport, setViewport] = useState(640);
  const [layout, setLayout] = useState<Record<string, Layout>>({});
  const layoutRef = useRef<Record<string, Layout>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [perfOn, setPerfOn] = useState(false);

  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const orbit = useSharedValue(0);
  const lastScroll = useSharedValue(0);

  const padding = Math.max(16, Math.min(28, width * 0.055));
  const contentW = width - padding * 2;

  const measure = useCallback(
    (id: string) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      setLayout((prev) => {
        const cur = prev[id];
        if (cur && Math.abs(cur.y - y) < 0.5 && Math.abs(cur.h - height) < 0.5) return prev;
        const next = { ...prev, [id]: { y, h: height } };
        layoutRef.current = next;
        return next;
      });
    },
    []
  );

  const onViewport = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setViewport(h);
  }, []);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
    const mid = e.contentOffset.y + viewport * 0.35;
    let idx = 0;
    for (let i = 0; i < scenes.length; i += 1) {
      const l = layoutRef.current[scenes[i].id];
      if (l && mid >= l.y) idx = i;
    }
    if (activeIndex !== idx) runOnJS(setActiveIndex)(idx);
  });

  // Hero camera: orbits on its own after load, then locks to scroll velocity.
  useFrameCallback((info) => {
    const dt = (info.timeSincePreviousFrame ?? 16) / 1000;
    const lock = clamp01(scrollY.value / 160);
    orbit.value += dt * 0.62 * (1 - lock * 0.78);
    const dy = scrollY.value - lastScroll.value;
    lastScroll.value = scrollY.value;
    orbit.value += dy * 0.005 * lock;
  }, true);

  const metricProgress = useDerivedValue(
    () => sceneProgress(scrollY, layout.metrics?.y ?? 0, layout.metrics?.h ?? 1, viewport),
    [layout.metrics?.y, layout.metrics?.h, viewport]
  );
  const galaxyProgress = useDerivedValue(
    () => sceneProgress(scrollY, layout.galaxy?.y ?? 0, layout.galaxy?.h ?? 1, viewport),
    [layout.galaxy?.y, layout.galaxy?.h, viewport]
  );
  const archProgress = useDerivedValue(
    () => sceneProgress(scrollY, layout.architecture?.y ?? 0, layout.architecture?.h ?? 1, viewport),
    [layout.architecture?.y, layout.architecture?.h, viewport]
  );
  const contactProgress = useDerivedValue(
    () => sceneProgress(scrollY, layout.contact?.y ?? 0, layout.contact?.h ?? 1, viewport),
    [layout.contact?.y, layout.contact?.h, viewport]
  );
  const pageProgress = useDerivedValue(
    () => clamp01(scrollY.value / Math.max(1, (layout.contact?.y ?? 1) + (layout.contact?.h ?? 1) - viewport)),
    [layout.contact?.y, layout.contact?.h, viewport]
  );

  const goTo = useCallback(
    (id: string) => {
      const l = layoutRef.current[id];
      if (!l) return;
      scrollRef.current?.scrollTo({ y: Math.max(0, l.y - NAV_HEIGHT - insets.top + 1), animated: true });
    },
    [insets.top]
  );

  const onOpenProject = useCallback(
    (project: Project) => navigation.navigate('CaseStudy', { id: project.id }),
    [navigation]
  );

  const filteredSkills = useMemo(
    () => (skillFilter === 'All' ? skills : skills.filter((s) => s.category === skillFilter)),
    [skillFilter]
  );

  const heroH = Math.max(viewport, 520);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]} onLayout={onViewport}>
      <TopNav
        width={width}
        activeScene={scenes[activeIndex]?.id ?? 'hero'}
        onScene={goTo}
        onPerfToggle={() => setPerfOn((v) => !v)}
        perfOn={perfOn}
      />
      <PerfBadge visible={perfOn} />
      <ProgressRail scenes={scenes} progress={pageProgress} activeIndex={activeIndex} onSelect={goTo} />

      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + NAV_HEIGHT, paddingBottom: 120 }}
      >
        {/* ── SCENE 00 · HERO ─────────────────────────────── */}
        <View style={{ height: heroH }} onLayout={measure('hero')}>
          <Starfield
            count={width < 420 ? 60 : 90}
            color={colors.text}
            accent={colors.accent}
            width={width}
            height={heroH}
            scrollY={scrollY}
            parallax={0.35}
          />
          <View style={{ height: heroH * 0.46, alignItems: 'center', justifyContent: 'center' }}>
            <LogoCluster t={orbit} size={width < 380 ? 74 : 104} radius={Math.min(width * 0.3, 132)} />
          </View>

          <View style={{ paddingHorizontal: padding, paddingBottom: 38, gap: 12 }}>
            <View style={styles.heroKickerRow}>
              <View style={[styles.pulse, { backgroundColor: colors.positive }]} />
              <Text style={[styles.heroKicker, { color: colors.textDim }]}>{profile.availability}</Text>
            </View>

            <Text style={[styles.heroName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.heroRole, { color: colors.accent }]}>
              {profile.role} <Text style={{ color: colors.textFaint }}>·</Text>{' '}
              <Text style={{ color: colors.textDim }}>{profile.focus}</Text>
            </Text>
            <Text style={[styles.heroTagline, { color: colors.textDim }]}>{profile.tagline}</Text>

            <View style={styles.heroActions}>
              <Pressable
                onPress={() => goTo('gallery')}
                accessibilityRole="button"
                style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.85 : 1 }]}
              >
                <LinearGradient
                  colors={[colors.accent, colors.accent2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryInner}
                >
                  <Ionicons name="cube-outline" size={15} color="#05060D" />
                  <Text style={styles.primaryText}>Enter the gallery</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => downloadResume(colors.name)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.ghostBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="download-outline" size={15} color={colors.text} />
                <Text style={[styles.ghostText, { color: colors.text }]}>Resume.md</Text>
              </Pressable>
            </View>

            <Text style={[styles.heroMeta, { color: colors.textFaint }]}>{profile.stats}</Text>
          </View>

          <View style={styles.scrollCue} pointerEvents="none">
            <Ionicons name="chevron-down" size={14} color={colors.textFaint} />
            <Text style={[styles.scrollCueText, { color: colors.textFaint }]}>scroll</Text>
          </View>
        </View>

        {/* ── SCENE 01 · METRICS ──────────────────────────── */}
        <View style={styles.scene} onLayout={measure('metrics')}>
          <View style={{ paddingHorizontal: padding }}>
            <SectionHeader
              index="01"
              title="Numbers that survived production"
              blurb="Measured on real devices over a release window — never on a lucky benchmark."
              accent={colors.positive}
            />
            <View style={styles.metricGrid}>
              {metrics.map((m) => (
                <MetricCard
                  key={m.label}
                  value={m.value}
                  suffix={m.suffix}
                  label={m.label}
                  note={m.note}
                  progress={metricProgress}
                  color={colors.positive}
                  width={contentW}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── SCENE 02 · GALLERY ──────────────────────────── */}
        <View style={styles.scene} onLayout={measure('gallery')}>
          <View style={{ paddingHorizontal: padding }}>
            <SectionHeader
              index="02"
              title="Selected work"
              blurb="Six builds, six device shells. Tap one to open the full dossier with the architecture diagram."
              accent={colors.accent2}
            />
          </View>
          <PhoneCarousel projects={projects} width={width} onOpen={onOpenProject} />
        </View>

        {/* ── SCENE 03 · SKILLS GALAXY ────────────────────── */}
        <View style={styles.scene} onLayout={measure('galaxy')}>
          <View style={{ paddingHorizontal: padding }}>
            <SectionHeader
              index="03"
              title="Skills galaxy"
              blurb="Each particle is a skill; radius is reach, brightness is depth. Filter the orbit, then tap a node."
              accent={colors.accent3}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 24, paddingBottom: 4 }}
              style={{ marginHorizontal: -padding, paddingHorizontal: padding }}
            >
              {skillCategories.map((c) => (
                <Chip
                  key={c.id}
                  label={c.label}
                  color={c.color}
                  active={skillFilter === c.id}
                  onPress={() => {
                    setSkillFilter(c.id);
                    setSelectedSkill(null);
                  }}
                />
              ))}
            </ScrollView>

            <SkillsGalaxy
              width={contentW}
              height={Math.min(contentW, 380)}
              skills={filteredSkills}
              dimOthers={false}
              selectedId={selectedSkill?.id ?? null}
              onSelect={(s) => setSelectedSkill((prev) => (prev?.id === s.id ? null : s))}
              accent={colors.accent3}
              dimColor={colors.textFaint}
            />
            <SkillCard skill={selectedSkill} onClear={() => setSelectedSkill(null)} width={contentW} />

            <GlassCard style={{ marginTop: 16 }}>
              <Text style={[styles.subhead, { color: colors.text }]}>How I level up a team</Text>
              <Text style={[styles.bodyText, { color: colors.textDim }]}>
                Skills are only interesting next to the systems they enable. I run architecture
                reviews, write the RFCs nobody wants to write, and keep a release train that
                anyone on the team can drive.
              </Text>
              <View style={styles.tagRow}>
                {['Design reviews', 'Mentoring', 'Incident postmortems', 'Release ownership'].map((t) => (
                  <View key={t} style={[styles.tag, { borderColor: colors.border }]}>
                    <Text style={[styles.tagText, { color: colors.textDim }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>
        </View>

        {/* ── SCENE 04 · ARCHITECTURE ─────────────────────── */}
        <View style={styles.scene} onLayout={measure('architecture')}>
          <View style={{ paddingHorizontal: padding }}>
            <SectionHeader
              index="04"
              title="The architecture I keep reusing"
              blurb="Scroll to separate the layers. Tap a slab or a legend row to read the module contract."
              accent={colors.accent}
            />
            <ArchitectureStack
              width={contentW}
              progress={archProgress}
              selectedId={selectedLayer}
              onSelect={(l) => setSelectedLayer((prev) => (prev === l.id ? null : l.id))}
            />
            <ArchitectureDetail
              layer={archLayers.find((l) => l.id === selectedLayer) ?? null}
              width={contentW}
              onClear={() => setSelectedLayer(null)}
            />

            <GlassCard style={{ marginTop: 16 }}>
              <Text style={[styles.subhead, { color: colors.text }]}>Principles, in order of stubbornness</Text>
              <View style={{ gap: 12, marginTop: 6 }}>
                {archPrinciples.map((p) => (
                  <View key={p.title} style={{ gap: 3 }}>
                    <Text style={[styles.principleTitle, { color: colors.accent2 }]}>{p.title}</Text>
                    <Text style={[styles.bodyText, { color: colors.textDim }]}>{p.body}</Text>
                  </View>
                ))}
              </View>
            </GlassCard>

            <View style={{ marginTop: 16 }}>
              <MermaidDiagram source={archMermaid} width={contentW} accent={colors.accent} />
            </View>
          </View>
        </View>

        {/* ── SCENE 05 · CONTACT ──────────────────────────── */}
        <View style={styles.scene} onLayout={measure('contact')}>
          <View style={{ paddingHorizontal: padding }}>
            <SectionHeader
              index="05"
              title="Contact constellation"
              blurb="Four stars, one signature. Tap a node to open the channel."
              accent={colors.accent3}
            />
            <ContactConstellation
              width={contentW}
              height={Math.min(contentW * 0.95, 360)}
              progress={contactProgress}
              links={links}
              onOpen={(link) => openLink(link.href)}
              accent={colors.accent3}
              lineColor={hexToRgba(colors.text, 0.22)}
              starColor={colors.textFaint}
            />

            <GlassCard style={{ marginTop: 22 }}>
              <Markdown
                source={`## Let's build something that lasts\n\nI take on **staff / principal mobile** work, architecture reviews, and ${'Flutter + Kotlin'} platform rewrites. Fastest way to reach me is **${profile.email}** — I answer within a day.\n\n- Available from Q4 2026\n- Berlin / CET, remote-first\n- Contract or full-time\n`}
                width={contentW}
                accent={colors.accent}
                color={colors.text}
                dimColor={colors.textDim}
              />
            </GlassCard>

            <Text style={[styles.footer, { color: colors.textFaint }]}>
              Built with React Native + Reanimated · 5 scroll-driven scenes · shaders stand in for
              iridescent materials · particle budgets enforced at 30fps
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scene: { paddingTop: 64, paddingBottom: 8 },
  heroKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulse: { width: 6, height: 6, borderRadius: 3 },
  heroKicker: { fontSize: 11.5, letterSpacing: 0.3, flexShrink: 1 },
  heroName: { fontSize: 44, fontWeight: '900', letterSpacing: -2, lineHeight: 48 },
  heroRole: { fontSize: 14.5, lineHeight: 22, fontWeight: '600' },
  heroTagline: { fontSize: 15, lineHeight: 23, maxWidth: 460 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  primaryBtn: { borderRadius: 999, overflow: 'hidden', ...softShadow(0.35, 14) },
  primaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryText: { color: '#05060D', fontWeight: '800', fontSize: 13.5 },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  ghostText: { fontWeight: '700', fontSize: 13.5 },
  heroMeta: { fontFamily: mono, fontSize: 11, letterSpacing: 0.6, marginTop: 4 },
  scrollCue: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 2,
  },
  scrollCueText: { fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', fontFamily: mono },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 3,
  },
  metricValue: { fontSize: 30, fontWeight: '900', letterSpacing: -1.4, fontFamily: mono },
  metricSuffix: { fontSize: 15, fontWeight: '800' },
  metricLabel: { fontSize: 12.5, fontWeight: '700', marginTop: 2 },
  metricNote: { fontSize: 10.5, fontFamily: mono },
  subhead: { fontSize: 15.5, fontWeight: '800', letterSpacing: -0.3 },
  bodyText: { fontSize: 13.5, lineHeight: 20 },
  principleTitle: { fontSize: 13, fontWeight: '800' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 10.5, fontWeight: '600' },
  footer: {
    textAlign: 'center',
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 26,
    paddingHorizontal: 10,
  },
});
