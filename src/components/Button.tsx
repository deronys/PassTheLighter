import { useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { buzz, play, type Sound } from '../feedback';
import { colors, flameGradient, fonts, nativeDriver } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  sound?: Sound | null;
};

// A pill button with the flame gradient (or glass for secondary) that squashes when pressed.
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
        {primary && <LinearGradient colors={flameGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
        <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 17,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  primary: {
    shadowColor: colors.flameHot,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.3,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: colors.onFlame,
  },
  secondaryLabel: {
    color: colors.text,
  },
});
