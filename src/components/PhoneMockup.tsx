import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect } from 'react-native-svg';
import { Project, ProjectScreen } from '../data/projects';
import { hexToRgba, mono } from '../theme/tokens';

const SCREEN_BG = '#080A12';
const SCREEN_FG = '#E8EBF7';
const SCREEN_DIM = '#7E88AC';

const StatusBar: React.FC<{ accent: string }> = ({ accent }) => (
  <View style={s.statusBar}>
    <Text style={s.statusTime}>9:41</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {[3, 5, 7, 9].map((h) => (
        <View key={h} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: SCREEN_DIM }} />
      ))}
      <View style={[s.battery, { borderColor: SCREEN_DIM }]}>
        <View style={{ width: 10, height: 6, borderRadius: 1, backgroundColor: accent }} />
      </View>
    </View>
  </View>
);

const Chips: React.FC<{ chips: string[]; accent: string }> = ({ chips, accent }) => (
  <View style={s.chipRow}>
    {chips.map((c, i) => (
      <View
        key={c}
        style={[
          s.chip,
          i === 0 && { backgroundColor: accent, borderColor: accent },
        ]}
      >
        <Text style={[s.chipText, i === 0 && { color: '#06070D', fontWeight: '800' }]}>{c}</Text>
      </View>
    ))}
  </View>
);

const RowList: React.FC<{ screen: ProjectScreen; accent: string }> = ({ screen, accent }) => (
  <View style={{ gap: 8 }}>
    {(screen.rows ?? []).map((r, i) => (
      <View key={r.label + i} style={s.row}>
        <View
          style={[
            s.rowDot,
            { backgroundColor: hexToRgba(accent, i % 2 === 0 ? 0.9 : 0.45) },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={s.rowLabel} numberOfLines={1}>
            {r.label}
          </Text>
          <Text style={s.rowMeta} numberOfLines={1}>
            {r.meta}
          </Text>
        </View>
        {r.value ? <Text style={s.rowValue}>{r.value}</Text> : null}
      </View>
    ))}
  </View>
);

const BarChart: React.FC<{ bars: number[]; accent: string }> = ({ bars, accent }) => (
  <View style={s.chart}>
    {bars.map((b, i) => (
      <View key={i} style={{ flex: 1, alignItems: 'center', gap: 3 }}>
        <View
          style={[
            s.bar,
            {
              height: 6 + (b / 100) * 62,
              backgroundColor: hexToRgba(accent, b > 70 ? 0.95 : 0.4),
            },
          ]}
        />
      </View>
    ))}
  </View>
);

const MapView: React.FC<{ screen: ProjectScreen; accent: string }> = ({ screen, accent }) => {
  const pins = screen.pins ?? [];
  const path = pins.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 200} ${p.y * 150}`).join(' ');
  return (
    <View style={s.map}>
      <Svg width="100%" height="100%" viewBox="0 0 200 150">
        {[0, 1, 2, 3, 4].map((i) => (
          <Line
            key={`h${i}`}
            x1={0}
            y1={i * 37}
            x2={200}
            y2={i * 37}
            stroke={hexToRgba(SCREEN_DIM, 0.18)}
            strokeWidth={0.6}
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Line
            key={`v${i}`}
            x1={i * 40}
            y1={0}
            x2={i * 40}
            y2={150}
            stroke={hexToRgba(SCREEN_DIM, 0.18)}
            strokeWidth={0.6}
          />
        ))}
        <Path d={path} stroke={accent} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray="6 4" />
        {pins.map((p) => (
          <Rect
            key={p.label}
            x={p.x * 200 - 7}
            y={p.y * 150 - 7}
            width={14}
            height={14}
            rx={4}
            fill={accent}
            opacity={0.9}
          />
        ))}
      </Svg>
    </View>
  );
};

const ScanView: React.FC<{ accent: string }> = ({ accent }) => (
  <View style={s.scan}>
    <Svg width="100%" height="100%" viewBox="0 0 200 120">
      {[
        'M 20 44 L 20 24 L 44 24',
        'M 156 24 L 180 24 L 180 44',
        'M 180 96 L 180 116 L 156 116',
        'M 44 116 L 20 116 L 20 96',
      ].map((d) => (
        <Path key={d} d={d} stroke={accent} strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      <Line x1={30} y1={60} x2={170} y2={60} stroke={accent} strokeWidth={2} opacity={0.85} />
    </Svg>
  </View>
);

const ChatView: React.FC<{ screen: ProjectScreen; accent: string }> = ({ screen, accent }) => (
  <View style={{ gap: 7 }}>
    {(screen.bubbles ?? []).map((b, i) => (
      <View
        key={i}
        style={[
          s.bubble,
          b.me
            ? { alignSelf: 'flex-end', backgroundColor: hexToRgba(accent, 0.9) }
            : { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.09)' },
        ]}
      >
        <Text style={[s.bubbleText, b.me && { color: '#06070D', fontWeight: '700' }]}>
          {b.text}
        </Text>
      </View>
    ))}
    <View style={[s.bubble, { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.09)', flexDirection: 'row', gap: 3 }]}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: SCREEN_DIM,
            opacity: 0.4 + i * 0.25,
          }}
        />
      ))}
    </View>
  </View>
);

const Body: React.FC<{ screen: ProjectScreen; accent: string }> = ({ screen, accent }) => {
  switch (screen.kind) {
    case 'dashboard':
      return (
        <View style={{ gap: 12 }}>
          <View style={s.balanceBlock}>
            <Text style={s.balanceLabel}>{screen.title}</Text>
            <Text style={[s.balanceValue, { color: accent }]}>€ 12,480.55</Text>
            <Text style={s.rowMeta}>{screen.subtitle}</Text>
          </View>
          <BarChart bars={screen.bars ?? []} accent={accent} />
          <RowList screen={screen} accent={accent} />
        </View>
      );
    case 'chat':
      return <ChatView screen={screen} accent={accent} />;
    case 'map':
      return (
        <View style={{ gap: 10 }}>
          <MapView screen={screen} accent={accent} />
          <RowList screen={screen} accent={accent} />
        </View>
      );
    case 'scan':
      return (
        <View style={{ gap: 12 }}>
          <ScanView accent={accent} />
          <RowList screen={screen} accent={accent} />
        </View>
      );
    case 'checkout':
      return (
        <View style={{ gap: 12 }}>
          <RowList screen={screen} accent={accent} />
          <View style={[s.totalRow, { borderColor: hexToRgba(accent, 0.4) }]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={[s.totalValue, { color: accent }]}>€ 12.54</Text>
          </View>
          <View style={[s.cta, { backgroundColor: accent }]}>
            <Ionicons name="card-outline" size={13} color="#06070D" />
            <Text style={s.ctaText}>Tap card to pay</Text>
          </View>
        </View>
      );
    case 'list':
    default:
      return (
        <View style={{ gap: 12 }}>
          <BarChart bars={[34, 52, 44, 68, 59, 77, 64, 82, 70, 61, 74, 88]} accent={accent} />
          <RowList screen={screen} accent={accent} />
        </View>
      );
  }
};

export interface PhoneMockupProps {
  project: Project;
  width: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ project, width }) => {
  const { screen, accent } = project;
  const height = width * 2.02;
  const bezel = Math.max(3, width * 0.018);

  return (
    <View
      style={[
        s.device,
        {
          width,
          height,
          borderRadius: width * 0.14,
          padding: bezel,
          shadowColor: accent,
        },
      ]}
    >
      <View
        style={[
          s.screen,
          {
            borderRadius: width * 0.14 - bezel,
            backgroundColor: SCREEN_BG,
          },
        ]}
      >
        <StatusBar accent={accent} />
        <View style={s.island} />
        <View style={{ paddingHorizontal: 14, paddingTop: 10, gap: 10, flex: 1 }}>
          <View>
            <Text style={s.appTitle} numberOfLines={1}>
              {screen.title}
            </Text>
            <Text style={s.rowMeta} numberOfLines={1}>
              {screen.subtitle}
            </Text>
          </View>
          <Chips chips={screen.chips} accent={accent} />
          <Body screen={screen} accent={accent} />
        </View>
        <View style={s.tabBar}>
          {(['grid', 'stats-chart', 'card', 'person'] as const).map((name, i) => (
            <Ionicons
              key={name}
              name={`${i === 0 ? '' : ''}${name}` as keyof typeof Ionicons.glyphMap}
              size={15}
              color={i === 0 ? accent : SCREEN_DIM}
            />
          ))}
        </View>
        <View style={s.homeIndicator} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  device: {
    backgroundColor: '#141828',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    shadowOpacity: 0.55,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  island: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    width: 54,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#000',
    zIndex: 5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  statusTime: { color: SCREEN_FG, fontSize: 9, fontWeight: '700' },
  battery: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 1,
    paddingVertical: 0.5,
    marginLeft: 4,
  },
  appTitle: { color: SCREEN_FG, fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  chipRow: { flexDirection: 'row', gap: 5 },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: { color: SCREEN_DIM, fontSize: 8.5, fontWeight: '700', letterSpacing: 0.2 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 74,
    paddingVertical: 4,
  },
  bar: { width: '70%', borderRadius: 3 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  rowDot: { width: 7, height: 7, borderRadius: 4 },
  rowLabel: { color: SCREEN_FG, fontSize: 10, fontWeight: '700' },
  rowMeta: { color: SCREEN_DIM, fontSize: 8.5, marginTop: 1 },
  rowValue: { color: SCREEN_FG, fontSize: 10, fontWeight: '700', fontFamily: mono },
  balanceBlock: { gap: 2 },
  balanceLabel: { color: SCREEN_DIM, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  balanceValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8, fontFamily: mono },
  map: {
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  scan: {
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bubbleText: { color: SCREEN_FG, fontSize: 9.5, lineHeight: 13 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  totalLabel: { color: SCREEN_DIM, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  totalValue: { fontSize: 17, fontWeight: '800', fontFamily: mono },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },
  ctaText: { color: '#06070D', fontSize: 11, fontWeight: '800' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 78,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 6,
  },
});
