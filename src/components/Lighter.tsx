import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, nativeDriver } from '../theme';

type Props = {
  size?: number;
  lit?: boolean;
};

// A drawn lighter with a flickering flame.
export function Lighter({ size = 120, lit = true }: Props) {
  const flicker = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!lit) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(flicker, { toValue: 0.3, duration: 140, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(flicker, { toValue: 0.8, duration: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.timing(flicker, { toValue: 0, duration: 160, easing: Easing.inOut(Easing.quad), useNativeDriver: nativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [lit, flicker]);

  const scaleY = flicker.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] });
  const scaleX = flicker.interpolate({ inputRange: [0, 1], outputRange: [1.04, 0.94] });
  const rotate = flicker.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const bodyWidth = size * 0.42;

  return (
    <View style={[styles.wrap, { height: size * 1.25 }]} accessibilityLabel="Lighter">
      {lit && (
        <Animated.View style={{ transform: [{ scaleX }, { scaleY }, { rotate }], marginBottom: -size * 0.06 }}>
          <View style={[styles.halo, { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 }]} />
          <Text style={{ fontSize: size * 0.42 }}>🔥</Text>
        </Animated.View>
      )}
      <View style={[styles.top, { width: bodyWidth * 0.9, height: size * 0.14 }]}>
        <View style={[styles.wheel, { width: size * 0.12, height: size * 0.12, borderRadius: size * 0.06 }]} />
      </View>
      <View style={[styles.body, { width: bodyWidth, height: size * 0.5, borderRadius: size * 0.07 }]}>
        <View style={styles.shine} />
      </View>
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
    top: '15%',
    backgroundColor: 'rgba(255, 177, 59, 0.25)',
  },
  top: {
    backgroundColor: '#C9CED6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  wheel: {
    backgroundColor: '#6B7280',
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  body: {
    backgroundColor: colors.flameHot,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    left: '18%',
    top: 6,
    bottom: 6,
    width: '14%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});
