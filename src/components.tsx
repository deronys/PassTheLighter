import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from './theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ label, onPress, disabled, variant = 'primary' }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.secondary,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.8 },
      ]}
    >
      <Text style={[styles.label, primary ? styles.primaryLabel : styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.flame,
  },
  secondary: {
    borderColor: colors.border,
    borderWidth: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  primaryLabel: {
    color: colors.onFlame,
  },
  secondaryLabel: {
    color: colors.text,
  },
  chip: {
    maxWidth: '100%',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  chipLabel: {
    fontSize: 15,
    color: colors.text,
  },
  chipLabelSelected: {
    color: colors.onFlame,
    fontWeight: '700',
  },
});
