import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    maxWidth: '100%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  selected: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  pressed: {
    opacity: 0.75,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  selectedLabel: {
    fontFamily: fonts.bold,
    color: colors.onFlame,
  },
});
