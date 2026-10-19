import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { buzz, play, type Sound } from '../feedback';
import { colors, fonts, nativeDriver } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  sound?: Sound | null;
};

// A chunky game button that squashes when pressed.
export function Button({ label, onPress, disabled, variant = 'primary', sound = 'tap' }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const springTo = (value: number) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: nativeDriver, speed: 40, bounciness: 12 }).start();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => springTo(0.94)}
      onPressOut={() => springTo(1)}
      onPress={() => {
        if (sound) play(sound);
        buzz();
        onPress();
      }}
    >
      <Animated.View
        style={[
          styles.button,
          primary ? styles.primary : styles.secondary,
          disabled && styles.disabled,
          { transform: [{ scale }] },
        ]}
      >
        <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.flame,
    borderBottomWidth: 5,
    borderBottomColor: colors.flameHot,
  },
  secondary: {
    backgroundColor: colors.surfaceStrong,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0, 0, 0, 0.35)',
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 0.8,
  },
  primaryLabel: {
    color: colors.onFlame,
  },
  secondaryLabel: {
    color: colors.text,
  },
});
