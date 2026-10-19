import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';

import { nativeDriver } from '../theme';

type Props = {
  children: ReactNode;
  delay?: number;
  // Restarts the animation when it changes.
  trigger?: unknown;
};

// Springs its content in from slightly smaller and lower.
export function PopIn({ children, delay = 0, trigger }: Props) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    value.setValue(0);
    Animated.spring(value, { toValue: 1, delay, useNativeDriver: nativeDriver, bounciness: 10, speed: 12 }).start();
  }, [trigger, delay, value]);

  const scale = value.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const opacity = value.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.3, 1, 1] });
  return <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>{children}</Animated.View>;
}
