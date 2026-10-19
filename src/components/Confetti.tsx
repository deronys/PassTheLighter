import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, nativeDriver } from '../theme';

const PIECES = 36;
const PALETTE = [colors.flame, colors.flameHot, colors.gold, '#7CE38B', '#4DD8E6', '#B57BFF', '#FF6FB5'];

// A burst of falling confetti, restarted whenever `burst` changes.
export function Confetti({ burst }: { burst: number }) {
  const { width, height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 120,
        spin: (Math.random() - 0.5) * 1440,
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 8,
        color: PALETTE[i % PALETTE.length],
      })),
    // New random pieces for each burst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burst, width],
  );

  useEffect(() => {
    if (burst === 0) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 2600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: nativeDriver,
    }).start();
  }, [burst, progress]);

  if (burst === 0) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const start = p.delay;
        const translateY = progress.interpolate({
          inputRange: [0, start, 1],
          outputRange: [-40, -40, height + 40],
        });
        const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: 0,
              width: p.size,
              height: p.size * 0.6,
              borderRadius: 2,
              backgroundColor: p.color,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
