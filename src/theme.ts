import { StyleSheet } from 'react-native';

export const colors = {
  background: '#14110F',
  surface: '#221D19',
  border: '#3A322B',
  text: '#F3ECE4',
  muted: '#A69B90',
  flame: '#FFB347',
  flameDark: '#E07A1F',
  onFlame: '#1B130B',
  danger: '#E5675A',
};

export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.flame,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
