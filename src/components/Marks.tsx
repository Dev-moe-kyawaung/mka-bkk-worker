import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SharedValue, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import Svg, { Circle, G, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { hexToRgba, iridescent } from '../theme/tokens';

const AnimatedSvgGradient = Animated.createAnimatedComponent(SvgGradient);

/**
 * Rotating gradient stops standing in for a custom iridescent fragment shader:
 * hue sweeps around the shape while a fresnel-ish rim bloom rides on top.
 */
const useSweep = (t: SharedValue<number>, speed: number, offset = 0) =>
  useAnimatedProps(() => {
    const a = t.value * speed + offset;
    return {
      x1: `${(0.5 + 0.5 * Math.cos(a)).toFixed(3)}%`,
      y1: `${(0.5 + 0.5 * Math.sin(a)).toFixed(3)}%`,
      x2: `${(0.5 - 0.5 * Math.cos(a)).toFixed(3)}%`,
      y2: `${(0.5 - 0.5 * Math.sin(a)).toFixed(3)}%`,
    };
  });

interface MarkProps {
  size: number;
  t: SharedValue<number>;
  id: string;
}

export const AndroidMark: React.FC<MarkProps> = ({ size, t, id }) => {
  const { isDark } = useTheme();
  const ramp = iridescent(isDark ? 'dark' : 'light');
  const props = useSweep(t, 0.6);

  return (
    <Svg width={size} height={size * 1.08} viewBox="0 0 120 130">
      <Defs>
        <AnimatedSvgGradient id={`${id}-fill`} gradientUnits="objectBoundingBox" animatedProps={props}>
          {ramp.map((c, i) => (
            <Stop key={c + i} offset={`${(i / (ramp.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </AnimatedSvgGradient>
      </Defs>
      {/* bloom pass */}
      <G opacity={isDark ? 0.35 : 0.22}>
        <Path
          d="M24 62 A36 36 0 0 1 96 62 L96 116 L24 116 Z"
          fill="none"
          stroke={ramp[0]}
          strokeWidth={7}
          strokeLinejoin="round"
        />
      </G>
      <G>
        <Path
          d="M36 30 L22 10"
          stroke={`url(#${id}-fill)`}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M84 30 L98 10"
          stroke={`url(#${id}-fill)`}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M24 62 A36 36 0 0 1 96 62 L96 116 L24 116 Z"
          fill={`url(#${id}-fill)`}
        />
        <Circle cx={45} cy={56} r={5} fill={isDark ? '#05060D' : '#F5F3EE'} />
        <Circle cx={75} cy={56} r={5} fill={isDark ? '#05060D' : '#F5F3EE'} />
        <Path
          d="M24 78 L96 78"
          stroke={hexToRgba(isDark ? '#05060D' : '#F5F3EE', 0.35)}
          strokeWidth={1.5}
        />
      </G>
    </Svg>
  );
};

export const FlutterMark: React.FC<MarkProps> = ({ size, t, id }) => {
  const { isDark } = useTheme();
  const ramp = iridescent(isDark ? 'dark' : 'light');
  const props = useSweep(t, 0.6, Math.PI * 0.66);

  return (
    <Svg width={size} height={size * 1.08} viewBox="0 0 26 27">
      <Defs>
        <AnimatedSvgGradient id={`${id}-fill`} gradientUnits="objectBoundingBox" animatedProps={props}>
          {ramp.map((c, i) => (
            <Stop key={c + i} offset={`${(i / (ramp.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </AnimatedSvgGradient>
      </Defs>
      <G opacity={isDark ? 0.3 : 0.2}>
        <Path
          d="M14.314 0 L2.3 12 L6 15.7 L23.68 0.02 Z"
          fill="none"
          stroke={ramp[1]}
          strokeWidth={0.9}
          strokeLinejoin="round"
        />
      </G>
      <G>
        <Path d="M14.314 0 L2.3 12 L6 15.7 L23.68 0.02 Z" fill={`url(#${id}-fill)`} />
        <Path d="M6.83 18.9 L14.31 26.37 L23.67 26.37 L16.21 18.9 Z" fill={`url(#${id}-fill)`} opacity={0.72} />
        <Path d="M14.314 11.43 L6.83 18.9 L10.5 22.6 L18 15.1 Z" fill={`url(#${id}-fill)`} opacity={0.9} />
      </G>
    </Svg>
  );
};

interface OrbitMarkProps {
  angle: SharedValue<number>;
  phase: number;
  radius: number;
  size: number;
  kind: 'android' | 'flutter';
  id: string;
}

/** Places a mark on an orbit ring and derives depth, scale and yaw from the angle. */
const OrbitMark: React.FC<OrbitMarkProps> = ({ angle, phase, radius, size, kind, id }) => {
  const style = useAnimatedStyle(() => {
    const a = angle.value + phase;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const x = cos * radius;
    const y = sin * radius * 0.42;
    const depth = (sin + 1) / 2;
    const scale = 0.66 + depth * 0.5;
    const yaw = -a * 34;
    const pitch = Math.sin(a * 0.5) * 12;
    return {
      opacity: 0.35 + depth * 0.65,
      transform: [
        { perspective: 900 },
        { translateX: x },
        { translateY: y },
        { rotateY: `${yaw}deg` },
        { rotateX: `${pitch}deg` },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.orbitMark, style]}
    >
      {kind === 'android' ? (
        <AndroidMark size={size} t={angle} id={id} />
      ) : (
        <FlutterMark size={size} t={angle} id={id} />
      )}
    </Animated.View>
  );
};

interface ClusterProps {
  t: SharedValue<number>;
  size: number;
  radius: number;
}

export const LogoCluster: React.FC<ClusterProps> = ({ t, size, radius }) => {
  const glow = useMemo(() => [0, Math.PI * 0.66, Math.PI, Math.PI * 1.66], []);
  const kinds: ('android' | 'flutter')[] = ['android', 'flutter', 'android', 'flutter'];

  return (
    <View style={styles.cluster} pointerEvents="none">
      <LinearGradient
        colors={[
          hexToRgba('#5EE7FF', 0.16),
          hexToRgba('#A97BFF', 0.1),
          'transparent',
        ]}
        style={styles.clusterGlow}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      {glow.map((phase, i) => (
        <OrbitMark
          key={phase}
          angle={t}
          phase={phase}
          radius={radius}
          size={size * (i % 2 === 0 ? 1 : 0.78)}
          kind={kinds[i]}
          id={`mark-${i}`}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  orbitMark: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
