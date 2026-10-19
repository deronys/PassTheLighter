import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, flameGradient, nativeDriver } from '../theme';

type Props = {
  size?: number;
  lit?: boolean;
};

// A sleek matte lighter with a flickering gradient flame and a soft glow.
export function Lighter({ size = 120, lit = true }: Props) {
  const flicker = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lit) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(flicker, { toValue: 0.3, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(flicker, { toValue: 0.8, duration: 260, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(flicker, { toValue: 0, duration: 200, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit, flicker]);

  const scaleY = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.1] });
  const scaleX = flicker.interpolate({ inputRange: [0, 1], outputRange: [1.03, 0.95] });
  const glow = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });

  const flame = size * 0.3;
  const bodyWidth = size * 0.4;

  return (
    <View style={[styles.wrap, { height: size * 1.2 }]} accessibilityLabel="Lighter">
      {lit && (
        <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: size * 0.5 }}>
          {[1, 0.7, 0.45].map((k) => (
            <Animated.View
              key={k}
              style={[
                styles.halo,
                { width: size * k, height: size * k, borderRadius: (size * k) / 2, bottom: size * (0.2 - k / 2), opacity: glow },
              ]}
            />
          ))}
          <Animated.View style={{ transform: [{ scaleX }, { scaleY }], marginBottom: size * 0.04 }}>
            <Flame size={flame} />
          </Animated.View>
        </View>
      )}
      <LinearGradient
        colors={['#D9D9E0', '#8C8C99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.cap, { width: bodyWidth * 0.86, height: size * 0.11, borderTopLeftRadius: size * 0.04, borderTopRightRadius: size * 0.04 }]}
      />
      <LinearGradient
        colors={['#2A2833', '#121117']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.body, { width: bodyWidth, height: size * 0.5, borderRadius: size * 0.08 }]}
      >
        <LinearGradient colors={flameGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.stripe, { height: size * 0.035 }]} />
      </LinearGradient>
    </View>
  );
}

// A gradient flame with a pale hot core, also used as a small icon.
export function Flame({ size }: { size: number }) {
  return (
    <View style={{ width: size, height: size * 1.25, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Drop size={size * 0.82} colors={[colors.flameHot, colors.flame]} />
      <View style={{ position: 'absolute', bottom: size * 0.08 }}>
        <Drop size={size * 0.4} colors={['#FFE2B8', '#FFB36B']} />
      </View>
    </View>
  );
}

// A teardrop: a square with one sharp corner, turned to point up.
function Drop({ size, colors: fill }: { size: number; colors: [string, string] }) {
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '45deg' }], borderRadius: size / 2, borderTopLeftRadius: 0, overflow: 'hidden' }}>
      <LinearGradient colors={fill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 60, 90, 0.1)',
  },
  cap: {
    marginBottom: 2,
  },
  body: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'flex-end',
    paddingBottom: '22%',
    overflow: 'hidden',
  },
  stripe: {
    width: '100%',
  },
});
