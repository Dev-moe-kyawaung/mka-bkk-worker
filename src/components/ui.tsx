import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono } from '../theme/tokens';

export const Chip: React.FC<{
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
  small?: boolean;
}> = ({ label, active, color, onPress, small }) => {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.chip,
        small && styles.chipSmall,
        {
          borderColor: active ? tint : colors.border,
          backgroundColor: active ? hexToRgba(tint, 0.16) : colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          small && { fontSize: 10.5 },
          { color: active ? tint : colors.textDim, fontWeight: active ? '800' : '600' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export const GlassCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  tone?: string;
}> = ({ children, style, tone }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceStrong,
          borderColor: tone ? hexToRgba(tone, 0.28) : colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const SectionHeader: React.FC<{
  index: string;
  title: string;
  blurb: string;
  accent: string;
  right?: React.ReactNode;
}> = ({ index, title, blurb, accent, right }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={[styles.kickerDot, { backgroundColor: accent }]} />
        <Text style={[styles.kicker, { color: accent }]}>scene {index}</Text>
        <View style={[styles.kickerLine, { backgroundColor: hexToRgba(accent, 0.3) }]} />
        {right}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.blurb, { color: colors.textDim }]}>{blurb}</Text>
    </View>
  );
};

export const IconButton: React.FC<{
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  color?: string;
  active?: boolean;
}> = ({ name, onPress, label, color, active }) => {
  const { colors } = useTheme();
  const tint = color ?? colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        {
          borderColor: active ? hexToRgba(tint, 0.5) : colors.border,
          backgroundColor: active ? colors.surface : 'transparent',
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Ionicons name={name} size={16} color={tint} />
    </Pressable>
  );
};

export const LoadingRow: React.FC<{ label?: string }> = ({ label = 'Loading' }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
      <Text style={[styles.loadingText, { color: colors.textDim }]}>{label}</Text>
    </View>
  );
};

export const EmptyState: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon, title, body, actionLabel, onAction }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { borderColor: colors.border }]}>
        <Ionicons name={icon} size={22} color={colors.textDim} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.textDim }]}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.emptyAction, { borderColor: colors.accent }]}
          accessibilityRole="button"
        >
          <Text style={[styles.emptyActionText, { color: colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 12, letterSpacing: 0.1 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  header: { gap: 8, marginBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerDot: { width: 6, height: 6, borderRadius: 3 },
  kicker: {
    fontSize: 10.5,
    fontFamily: mono,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  kickerLine: { flex: 1, height: 1 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  blurb: { fontSize: 14, lineHeight: 20, maxWidth: 460 },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  loadingText: { fontSize: 12, fontFamily: mono, letterSpacing: 0.6 },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  emptyAction: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  emptyActionText: { fontSize: 12.5, fontWeight: '700' },
});
