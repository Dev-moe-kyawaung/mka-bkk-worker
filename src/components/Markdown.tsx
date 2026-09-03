import React, { useMemo } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Block, Inline, parseMarkdown, parseMermaid } from '../lib/markdown';
import { hexToRgba, mono } from '../theme/tokens';

const BOX_W = 124;
const BOX_H = 38;
const GAP_X = 52;
const GAP_Y = 18;

export const MermaidDiagram: React.FC<{
  source: string;
  width: number;
  accent: string;
}> = ({ source, width, accent }) => {
  const graph = useMemo(() => parseMermaid(source), [source]);

  const layout = useMemo(() => {
    const { nodes, dir } = graph;
    const cols = new Map<number, typeof nodes>();
    nodes.forEach((n) => {
      const list = cols.get(n.depth) ?? [];
      list.push(n);
      cols.set(n.depth, list);
    });
    const depths = [...cols.keys()].sort((a, b) => a - b);
    const maxPer = Math.max(...depths.map((d) => cols.get(d)?.length ?? 0), 1);

    const positions = new Map<string, { x: number; y: number }>();
    const margin = 12;

    if (dir === 'TD') {
      const contentW = depths.length * BOX_W + Math.max(0, depths.length - 1) * GAP_X + margin * 2;
      const contentH = maxPer * BOX_H + Math.max(0, maxPer - 1) * GAP_Y + margin * 2;
      depths.forEach((depth, di) => {
        const list = cols.get(depth) ?? [];
        const columnH = list.length * BOX_H + (list.length - 1) * GAP_Y;
        const startY = (contentH - columnH) / 2;
        list.forEach((node, ni) => {
          positions.set(node.id, {
            x: margin + di * (BOX_W + GAP_X),
            y: startY + ni * (BOX_H + GAP_Y),
          });
        });
      });
      return { positions, dir, contentW, contentH };
    }

    const contentH = depths.length * BOX_H + Math.max(0, depths.length - 1) * GAP_Y + margin * 2;
    const contentW = maxPer * BOX_W + Math.max(0, maxPer - 1) * GAP_X + margin * 2;
    depths.forEach((depth, di) => {
      const list = cols.get(depth) ?? [];
      const rowW = list.length * BOX_W + (list.length - 1) * GAP_X;
      const startX = (contentW - rowW) / 2;
      list.forEach((node, ni) => {
        positions.set(node.id, {
          x: startX + ni * (BOX_W + GAP_X),
          y: margin + di * (BOX_H + GAP_Y),
        });
      });
    });
    return { positions, dir, contentW, contentH };
  }, [graph]);

  const { positions, dir, contentW, contentH } = layout;
  const frameW = Math.min(width, 460);
  const scale = Math.min(1, (frameW - 12) / Math.max(contentW, 1));

  return (
    <View style={[styles.diagram, { width: frameW }]}>
      <View style={[styles.diagramFrame, { height: contentH * scale + 12 }]}>
        <View
          style={{
            width: contentW,
            height: contentH,
            transform: [{ scale }],
            transformOrigin: 'top left',
          }}
        >
        <Svg width={Math.max(contentW, 1)} height={contentH}>
          {graph.edges.map((e) => {
            const a = positions.get(e.from);
            const b = positions.get(e.to);
            if (!a || !b) return null;
            let d: string;
            if (dir === 'TD') {
              const x1 = a.x + BOX_W / 2;
              const y1 = a.y + BOX_H;
              const x2 = b.x + BOX_W / 2;
              const y2 = b.y;
              const midY = y1 + GAP_Y / 2;
              d = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
            } else {
              const x1 = a.x + BOX_W;
              const y1 = a.y + BOX_H / 2;
              const x2 = b.x;
              const y2 = b.y + BOX_H / 2;
              const midX = x1 + GAP_X / 2;
              d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
            }
            return <Path key={`${e.from}-${e.to}`} d={d} stroke={hexToRgba(accent, 0.55)} strokeWidth={1.4} fill="none" />;
          })}
          {graph.nodes.map((n) => {
            const pos = positions.get(n.id);
            if (!pos) return null;
            return (
              <Rect
                key={n.id}
                x={pos.x}
                y={pos.y}
                width={BOX_W}
                height={BOX_H}
                rx={10}
                fill={hexToRgba(accent, 0.1)}
                stroke={hexToRgba(accent, 0.65)}
                strokeWidth={1.2}
              />
            );
          })}
        </Svg>
        {graph.nodes.map((n) => {
          const pos = positions.get(n.id);
          if (!pos) return null;
          return (
            <Text
              key={`${n.id}-label`}
              numberOfLines={1}
              style={[
                styles.diagramLabel,
                { left: pos.x, top: pos.y, width: BOX_W, height: BOX_H },
              ]}
            >
              {n.label}
            </Text>
          );
        })}
        </View>
      </View>
      <Text style={styles.diagramCaption}>mermaid · {dir === 'TD' ? 'top-down flow' : 'left-right flow'}</Text>
    </View>
  );
};

const InlineText: React.FC<{ inlines: Inline[]; color: string; accent: string; size: number }> = ({
  inlines,
  color,
  accent,
  size,
}) => (
  <Text style={{ color, fontSize: size, lineHeight: size * 1.55 }}>
    {inlines.map((inline, i) => {
      if (inline.kind === 'bold') {
        return (
          <Text key={i} style={{ fontWeight: '800', color }}>
            {inline.value}
          </Text>
        );
      }
      if (inline.kind === 'italic') {
        return (
          <Text key={i} style={{ fontStyle: 'italic' }}>
            {inline.value}
          </Text>
        );
      }
      if (inline.kind === 'code') {
        return (
          <Text key={i} style={[styles.inlineCode, { color: accent }]}>
            {inline.value}
          </Text>
        );
      }
      if (inline.kind === 'link') {
        return (
          <Text
            key={i}
            style={{ color: accent, textDecorationLine: 'underline' }}
            onPress={() => {
              Linking.openURL(inline.href).catch(() => {});
            }}
          >
            {inline.label}
          </Text>
        );
      }
      return (
        <Text key={i}>{inline.value}</Text>
      );
    })}
  </Text>
);

interface MarkdownProps {
  source: string;
  width: number;
  accent: string;
  color: string;
  dimColor: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ source, width, accent, color, dimColor }) => {
  const blocks = useMemo(() => parseMarkdown(source), [source]);

  const renderBlock = (block: Block, i: number) => {
    switch (block.kind) {
      case 'heading':
        return (
          <Text
            key={i}
            style={[
              styles.heading,
              block.level === 1 && { fontSize: 27 },
              block.level === 2 && { fontSize: 19, marginTop: 26 },
              block.level === 3 && { fontSize: 15.5, marginTop: 18 },
              { color },
            ]}
          >
            {block.inlines.map((inl, k) => (
              <Text key={k} style={block.level > 1 ? { color: accent } : undefined}>
                {'value' in inl ? inl.value : inl.label}
              </Text>
            ))}
          </Text>
        );
      case 'paragraph':
        return <InlineText key={i} inlines={block.inlines} color={dimColor} accent={accent} size={14.5} />;
      case 'quote':
        return (
          <View key={i} style={[styles.quote, { borderLeftColor: accent }]}>
            <InlineText inlines={block.inlines} color={dimColor} accent={accent} size={13.5} />
          </View>
        );
      case 'list':
        return (
          <View key={i} style={{ gap: 9 }}>
            {block.items.map((item, k) => (
              <View key={k} style={styles.listRow}>
                <View style={[styles.bullet, { backgroundColor: accent }]} />
                <View style={{ flex: 1 }}>
                  <InlineText inlines={item} color={dimColor} accent={accent} size={14} />
                </View>
              </View>
            ))}
          </View>
        );
      case 'code':
        return (
          <View key={i} style={styles.codeWrap}>
            <View style={styles.codeHead}>
              <View style={[styles.codeDot, { backgroundColor: accent }]} />
              <Text style={styles.codeLang}>{block.lang}</Text>
            </View>
            <Text style={styles.code}>{block.source}</Text>
          </View>
        );
      case 'mermaid':
        return <MermaidDiagram key={i} source={block.source} width={width} accent={accent} />;
      case 'divider':
        return <View key={i} style={[styles.divider, { backgroundColor: hexToRgba(accent, 0.25) }]} />;
      default:
        return null;
    }
  };

  return <View style={{ gap: 15, width }}>{blocks.map(renderBlock)}</View>;
};

const styles = StyleSheet.create({
  heading: {
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  inlineCode: {
    fontFamily: mono,
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  quote: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    paddingVertical: 2,
  },
  listRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  codeWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(8,10,20,0.9)',
    overflow: 'hidden',
  },
  codeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  codeDot: { width: 6, height: 6, borderRadius: 3 },
  codeLang: {
    color: '#98A1C4',
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  code: {
    color: '#D5DEF7',
    fontSize: 11.5,
    lineHeight: 18,
    fontFamily: mono,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  diagram: {
    gap: 8,
  },
  diagramFrame: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    overflow: 'scroll',
  },
  diagramLabel: {
    position: 'absolute',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E8EBF7',
    includeFontPadding: false,
  },
  diagramCaption: {
    color: '#5C6488',
    fontSize: 9.5,
    fontFamily: mono,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
