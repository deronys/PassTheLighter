import { Platform, StyleSheet } from 'react-native';

// A late night out: near-black, glassy surfaces, a hot orange-to-pink flame
// gradient as the accent and acid lime for confirmed picks.
export const colors = {
  night: '#09090B',
  dusk: '#15121D',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceStrong: 'rgba(255, 255, 255, 0.09)',
  border: 'rgba(255, 255, 255, 0.09)',
  text: '#F5F4F7',
  muted: '#8D8A99',
  flame: '#FF6A2B',
  flameHot: '#FF2D6F',
  ember: '#FF9F6B',
  onFlame: '#FFFFFF',
  gold: '#FFC94D',
  // A confirmed choice, such as a vote.
  pick: '#C8FF3D',
};

// The accent gradient, for primary buttons, highlights and the flame.
export const flameGradient: [string, string] = [colors.flame, colors.flameHot];

export const fonts = {
  display: 'Unbounded_700Bold',
  body: 'Inter_500Medium',
  semi: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// The native driver is not available on web.
export const nativeDriver = Platform.OS !== 'web';

export const common = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  // Small spaced-out caps above a section.
  label: {
    fontFamily: fonts.semi,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.muted,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
