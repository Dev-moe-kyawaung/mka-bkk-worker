import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SharedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ContactConstellation, openLink } from '../components/Constellation';
import { GlassCard, SectionHeader } from '../components/ui';
import { NAV_HEIGHT } from '../components/TopNav';
import { links, profile } from '../data/profile';
import { success as hapticSuccess, tap } from '../lib/haptics';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, mono, softShadow } from '../theme/tokens';
import { TabScreenProps } from '../navigation/types';

type Status = 'idle' | 'sending' | 'sent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder: string;
  color: string;
  keyboardType?: 'default' | 'email-address';
  returnKeyType?: 'next' | 'done' | 'send';
  multiline?: boolean;
  onSubmit?: () => void;
  accent: string;
}> = ({ label, value, onChange, error, placeholder, color, keyboardType = 'default', returnKeyType = 'next', multiline, onSubmit, accent }) => (
  <View style={{ gap: 6 }}>
    <Text style={[styles.label, { color }]}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={hexToRgba(color, 0.45)}
      keyboardType={keyboardType}
      returnKeyType={returnKeyType}
      multiline={multiline}
      onSubmitEditing={onSubmit}
      autoCorrect={!multiline}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        {
          color,
          borderColor: error ? '#FF7A7A' : hexToRgba(color, 0.18),
          backgroundColor: hexToRgba(color, 0.04),
        },
      ]}
      accessibilityLabel={label}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

export const ContactScreen: React.FC<TabScreenProps<'Contact'>> = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const contentW = width - 32;

  const draw = useSharedValue(0) as SharedValue<number>;
  useEffect(() => {
    draw.value = withTiming(1, { duration: 1900 });
  }, [draw]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState<Status>('idle');
  const emailRef = useRef<TextInput>(null);
  const messageRef = useRef<TextInput>(null);

  const submit = useCallback(() => {
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = 'Tell me who you are.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'That address will not reach you.';
    if (message.trim().length < 12) next.message = 'A sentence or two of context helps.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      hapticSuccess();
    }, 950);
  }, [name, email, message]);

  const reset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setErrors({});
    setStatus('idle');
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: draw.value,
    transform: [{ translateY: (1 - draw.value) * 20 }],
  }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + NAV_HEIGHT + 24,
          paddingBottom: 140,
          paddingHorizontal: 16,
          gap: 18,
        }}
      >
        <SectionHeader
          index="05"
          title="Contact constellation"
          blurb="Tap a star to open the channel, or send a proper message below."
          accent={colors.accent3}
        />

        <ContactConstellation
          width={contentW}
          height={Math.min(contentW * 0.95, 340)}
          progress={draw}
          links={links}
          onOpen={(link) => {
            tap();
            openLink(link.href);
          }}
          accent={colors.accent3}
          lineColor={hexToRgba(colors.text, 0.22)}
          starColor={colors.textFaint}
        />

        <GlassCard style={cardStyle}>
          <View style={styles.availabilityRow}>
            <View style={[styles.dot, { backgroundColor: colors.positive }]} />
            <Text style={[styles.availability, { color: colors.text }]}>{profile.availability}</Text>
          </View>
          <Text style={[styles.body, { color: colors.textDim }]}>
            {profile.location} · replies within one working day. For urgent production incidents,
            email is still the fastest lane.
          </Text>
        </GlassCard>

        <GlassCard style={{ gap: 14 }}>
          {status === 'sent' ? (
            <View style={styles.sent}>
              <Ionicons name="checkmark-circle" size={30} color={colors.positive} />
              <Text style={[styles.sentTitle, { color: colors.text }]}>Message queued</Text>
              <Text style={[styles.body, { color: colors.textDim }]}>
                Thanks {name.split(' ')[0]} — this demo build keeps everything on device, so nothing
                left your phone. In production this posts to the contact endpoint.
              </Text>
              <Pressable onPress={reset} style={[styles.primary, { backgroundColor: colors.accent }]}>
                <Text style={styles.primaryText}>Write another</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.formTitle, { color: colors.text }]}>Send a message</Text>
              <Field
                label="NAME"
                value={name}
                onChange={setName}
                error={errors.name}
                placeholder="Ada Lovelace"
                color={colors.text}
                accent={colors.accent}
                returnKeyType="next"
                onSubmit={() => emailRef.current?.focus()}
              />
              <Field
                label="EMAIL"
                value={email}
                onChange={setEmail}
                error={errors.email}
                placeholder="you@company.com"
                color={colors.text}
                accent={colors.accent}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmit={() => messageRef.current?.focus()}
              />
              <Field
                label="MESSAGE"
                value={message}
                onChange={setMessage}
                error={errors.message}
                placeholder="What are you building, and what is in the way?"
                color={colors.text}
                accent={colors.accent}
                multiline
                returnKeyType="done"
              />

              <Pressable
                onPress={submit}
                disabled={status === 'sending'}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.primary,
                  {
                    backgroundColor: colors.accent,
                    opacity: status === 'sending' ? 0.6 : pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={status === 'sending' ? 'time-outline' : 'paper-plane-outline'}
                  size={15}
                  color="#05060D"
                />
                <Text style={styles.primaryText}>
                  {status === 'sending' ? 'Sending…' : 'Send message'}
                </Text>
              </Pressable>
              <Text style={[styles.fine, { color: colors.textFaint }]}>
                No tracking, no newsletter, no CRM. The form is validated on device.
              </Text>
            </>
          )}
        </GlassCard>

        <View style={styles.links}>
          {links.map((l) => (
            <Pressable
              key={l.id}
              onPress={() => {
                tap();
                openLink(l.href);
              }}
              accessibilityRole="link"
              style={({ pressed }) => [
                styles.linkCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: pressed ? hexToRgba(l.color, 0.6) : colors.border,
                },
              ]}
            >
              <View style={[styles.linkIcon, { backgroundColor: hexToRgba(l.color, 0.14) }]}>
                <Ionicons name={l.icon} size={16} color={l.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkLabel, { color: colors.text }]}>{l.label}</Text>
                <Text style={[styles.linkHandle, { color: colors.textFaint }]}>{l.handle}</Text>
              </View>
              <Ionicons name="open-outline" size={15} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  availability: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  body: { fontSize: 13, lineHeight: 19 },
  formTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  label: { fontSize: 10, fontFamily: mono, letterSpacing: 1.4 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 14.5,
  },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top' },
  error: { color: '#FF7A7A', fontSize: 11.5 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 999,
    ...softShadow(0.3, 12),
  },
  primaryText: { color: '#05060D', fontWeight: '800', fontSize: 13.5 },
  fine: { fontSize: 10.5, textAlign: 'center' },
  sent: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  sentTitle: { fontSize: 18, fontWeight: '800' },
  links: { gap: 10 },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  linkIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { fontSize: 13.5, fontWeight: '700' },
  linkHandle: { fontSize: 11, fontFamily: mono, marginTop: 2 },
});
