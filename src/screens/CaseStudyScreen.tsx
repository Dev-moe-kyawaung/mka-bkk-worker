import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Markdown } from '../components/Markdown';
import { PhoneMockup } from '../components/PhoneMockup';
import { GlassCard } from '../components/ui';
import { projects } from '../data/projects';
import { buildCaseStudy } from '../lib/caseStudy';
import { tap } from '../lib/haptics';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono, softShadow } from '../theme/tokens';
import { RootStackParamList, RootStackScreenProps } from '../navigation/types';

const Fade: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 420 }));
  }, [delay, p]);
  const style = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 16 }],
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
};

const shareCase = async (name: string, markdown: string) => {
  if (Platform.OS === 'web') {
    try {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-case-study.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    await Share.share({ message: markdown, title: `${name} case study` });
  } catch {
    /* cancelled */
  }
};

export const CaseStudyScreen: React.FC<RootStackScreenProps<'CaseStudy'>> = ({ route }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const project = useMemo(() => projects.find((p) => p.id === route.params.id) ?? projects[0], [route.params.id]);
  const markdown = useMemo(() => buildCaseStudy(project), [project]);
  const contentW = width - 32;

  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects[(index + 1) % projects.length];
  const prev = projects[(index - 1 + projects.length) % projects.length];

  const meta = [
    { label: 'Client', value: project.client },
    { label: 'Role', value: project.role },
    { label: 'Window', value: `${project.year}` },
    { label: 'Team', value: project.team },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8, borderColor: colors.border, backgroundColor: colors.navBg }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { borderColor: colors.border }]}
          accessibilityLabel="Back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={18} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topTitle, { color: colors.text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={[styles.topSub, { color: colors.textFaint }]}>
            case study · {project.category}
          </Text>
        </View>
        <Pressable
          onPress={() => shareCase(project.name, markdown)}
          style={[styles.iconBtn, { borderColor: colors.border }]}
          accessibilityLabel="Share case study"
          accessibilityRole="button"
        >
          <Ionicons name="share-outline" size={17} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60, paddingHorizontal: 16, gap: 18 }}
      >
        <Fade delay={40}>
          <View style={[styles.hero, { borderColor: hexToRgba(project.accent, 0.3) }]}>
            <LinearGradient
              colors={[hexToRgba(project.accent, 0.28), 'transparent']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.deviceWrap}>
              <View
                style={[
                  styles.deviceGlow,
                  {
                    width: width * 0.62,
                    height: width * 0.62,
                    borderRadius: width * 0.31,
                    backgroundColor: hexToRgba(project.accent, 0.16),
                  },
                ]}
              />
              <View style={styles.deviceInner}>
                <PhoneMockup project={project} width={Math.min(width * 0.42, 168)} />
              </View>
            </View>
            <Text style={[styles.heroTagline, { color: colors.text }]}>{project.tagline}</Text>
            <View style={styles.highlightRow}>
              {project.highlights.map((h) => (
                <View key={h} style={[styles.highlight, { borderColor: hexToRgba(project.accent, 0.45) }]}>
                  <Text style={[styles.highlightText, { color: project.accent }]}>{h}</Text>
                </View>
              ))}
            </View>
          </View>
        </Fade>

        <Fade delay={120}>
          <View style={styles.metaGrid}>
            {meta.map((m) => (
              <View
                key={m.label}
                style={[styles.metaCell, { backgroundColor: colors.surface, borderColor: colors.border, width: (contentW - 10) / 2 }]}
              >
                <Text style={[styles.metaLabel, { color: colors.textFaint }]}>{m.label}</Text>
                <Text style={[styles.metaValue, { color: colors.text }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </Fade>

        <Fade delay={200}>
          <GlassCard>
            <Markdown
              source={markdown}
              width={contentW - 32}
              accent={project.accent}
              color={colors.text}
              dimColor={colors.textDim}
            />
          </GlassCard>
        </Fade>

        <Fade delay={280}>
          <View style={{ gap: 10 }}>
            <Text style={[styles.moreLabel, { color: colors.textFaint }]}>keep reading</Text>
            <View style={styles.moreRow}>
              <Pressable
                onPress={() => {
                  tap();
                  navigation.goBack();
                }}
                style={[styles.moreBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Ionicons name="arrow-back" size={14} color={colors.textDim} />
                <Text style={[styles.moreText, { color: colors.textDim }]}>{prev.name}</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  tap();
                  navigation.push('CaseStudy', { id: next.id });
                }}
                style={[styles.moreBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={[styles.moreText, { color: colors.textDim }]}>{next.name}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.textDim} />
              </Pressable>
            </View>
          </View>
        </Fade>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  topSub: { fontSize: 10, fontFamily: mono, letterSpacing: 0.6, marginTop: 1 },
  hero: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
    ...softShadow(0.35, 20),
  },
  deviceWrap: { alignItems: 'center', justifyContent: 'center' },
  deviceGlow: { position: 'absolute' },
  deviceInner: { transform: [{ perspective: 900 }, { rotateY: '-16deg' }, { rotateX: '4deg' }] },
  heroTagline: { fontSize: 15.5, lineHeight: 22, textAlign: 'center', fontWeight: '600' },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  highlight: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  highlightText: { fontSize: 11, fontWeight: '800' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaCell: { borderWidth: 1, borderRadius: 16, padding: 13, gap: 4 },
  metaLabel: { fontSize: 9.5, fontFamily: mono, letterSpacing: 1.2, textTransform: 'uppercase' },
  metaValue: { fontSize: 13.5, fontWeight: '700' },
  moreLabel: { fontSize: 10, fontFamily: mono, letterSpacing: 1.6, textTransform: 'uppercase' },
  moreRow: { flexDirection: 'row', gap: 10 },
  moreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 12,
  },
  moreText: { fontSize: 12.5, fontWeight: '700' },
});
