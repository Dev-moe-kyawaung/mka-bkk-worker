import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profile, scenes } from '../data/profile';
import { downloadResume, ResumeResult } from '../lib/resume';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono, softShadow } from '../theme/tokens';

interface TopNavProps {
  width: number;
  activeScene: string;
  onScene: (sceneId: string) => void;
  onPerfToggle: () => void;
  perfOn: boolean;
}

export const NAV_HEIGHT = 58;

export const TopNav: React.FC<TopNavProps> = ({
  width,
  activeScene,
  onScene,
  onPerfToggle,
  perfOn,
}) => {
  const { colors, toggle, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumeState, setResumeState] = useState<ResumeResult | null>(null);
  const compact = width < 780;

  const handleResume = async () => {
    const result = await downloadResume(colors.name);
    setResumeState(result);
    setTimeout(() => setResumeState(null), 2600);
  };

  const go = (id: string) => {
    setMenuOpen(false);
    onScene(id);
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: colors.navBg, borderColor: colors.border }]}>
      <View style={[styles.bar, { height: NAV_HEIGHT }]}>
        <Pressable
          onPress={() => go('hero')}
          style={styles.brand}
          accessibilityRole="button"
          accessibilityLabel="Back to top"
        >
          <LinearGradient
            colors={[colors.accent, colors.accent2, colors.accent3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.mono, softShadow(0.4, 10)]}
          >
            <Text style={styles.monoText}>{profile.initials}</Text>
          </LinearGradient>
          {!compact ? (
            <View>
              <Text style={[styles.brandName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.brandRole, { color: colors.textDim }]}>{profile.role}</Text>
            </View>
          ) : null}
        </Pressable>

        {!compact ? (
          <View style={styles.links}>
            {scenes.map((s) => {
              const active = activeScene === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => go(s.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
                >
                  <Text
                    style={[
                      styles.linkText,
                      { color: active ? colors.accent : colors.textDim },
                      active && { fontWeight: '800' },
                    ]}
                  >
                    {s.label}
                  </Text>
                  <View
                    style={[
                      styles.linkUnderline,
                      { backgroundColor: active ? colors.accent : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={onPerfToggle}
            style={[styles.perf, { borderColor: perfOn ? colors.positive : colors.border }]}
            accessibilityLabel="Toggle performance monitor"
          >
            <View
              style={[
                styles.perfDot,
                { backgroundColor: perfOn ? colors.positive : colors.textFaint },
              ]}
            />
            <Text style={[styles.perfText, { color: perfOn ? colors.positive : colors.textFaint }]}>perf</Text>
          </Pressable>

          <Pressable
            onPress={toggle}
            accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            style={[styles.iconBtn, { borderColor: colors.border }]}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={16} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={handleResume}
            accessibilityLabel="Download resume"
            style={[styles.resume, { borderColor: hexToRgba(colors.accent, 0.5), backgroundColor: hexToRgba(colors.accent, 0.12) }]}
          >
            <Ionicons name="download-outline" size={14} color={colors.accent} />
            {!compact ? (
              <Text style={[styles.resumeText, { color: colors.accent }]}>Resume</Text>
            ) : null}
          </Pressable>

          {compact ? (
            <Pressable
              onPress={() => setMenuOpen((v) => !v)}
              accessibilityLabel="Open scene menu"
              style={[styles.iconBtn, { borderColor: colors.border }]}
            >
              <Ionicons name={menuOpen ? 'close' : 'apps'} size={16} color={colors.text} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {menuOpen && compact ? (
        <View style={[styles.sheet, { backgroundColor: colors.surfaceStrong, borderColor: colors.border }]}>
          {scenes.map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => go(s.id)}
              style={[styles.sheetRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <Text style={[styles.sheetIndex, { color: colors.textFaint }]}>{s.index}</Text>
              <Text style={[styles.sheetLabel, { color: activeScene === s.id ? colors.accent : colors.text }]}>
                {s.label}
              </Text>
              <Ionicons name="arrow-forward" size={13} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {resumeState ? (
        <View style={[styles.toast, { backgroundColor: colors.surfaceStrong, borderColor: colors.border }]}>
          <Ionicons
            name={resumeState === 'unavailable' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            size={14}
            color={resumeState === 'unavailable' ? colors.warning : colors.positive}
          />
          <Text style={[styles.toastText, { color: colors.text }]}>
            {resumeState === 'downloaded'
              ? 'Resume downloaded (markdown)'
              : resumeState === 'shared'
                ? 'Resume ready to share'
                : 'Sharing unavailable on this device'}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    borderBottomWidth: 1,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    gap: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mono: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monoText: { color: '#05060D', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  brandName: { fontSize: 13.5, fontWeight: '800', letterSpacing: -0.2 },
  brandRole: { fontSize: 10, fontFamily: mono, letterSpacing: 0.4 },
  links: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { paddingHorizontal: 9, paddingVertical: 6, alignItems: 'center' },
  linkText: { fontSize: 12.5, letterSpacing: 0.1 },
  linkUnderline: { height: 2, borderRadius: 1, marginTop: 3, width: '70%' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resume: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
  },
  resumeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
  perf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 13,
    borderWidth: 1,
  },
  perfDot: { width: 5, height: 5, borderRadius: 3 },
  perfText: { fontSize: 9.5, fontFamily: mono, letterSpacing: 0.8, textTransform: 'uppercase' },
  sheet: {
    margin: 10,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  sheetIndex: { fontFamily: mono, fontSize: 11, width: 22 },
  sheetLabel: { flex: 1, fontSize: 14, fontWeight: '700' },
  toast: {
    position: 'absolute',
    top: NAV_HEIGHT + 52,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  toastText: { fontSize: 12, fontWeight: '600' },
});
