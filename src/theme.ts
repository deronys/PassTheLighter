import { Platform, StyleSheet } from 'react-native';

// A night out lit by a lighter: deep violet-blue darkness, warm flame accents.
export const colors = {
  night: '#120B24',
  dusk: '#2A1846',
  surface: 'rgba(255, 255, 255, 0.07)',
  surfaceStrong: 'rgba(255, 255, 255, 0.13)',
  border: 'rgba(255, 255, 255, 0.14)',
  text: '#FFF4E6',
  muted: '#BBA9D6',
  flame: '#FFB13B',
  flameHot: '#FF5E3A',
  ember: '#FFD86B',
  onFlame: '#2B1300',
  gold: '#FFD34D',
};

export const fonts = {
  display: 'LuckiestGuy_400Regular',
  body: 'Nunito_600SemiBold',
  bold: 'Nunito_800ExtraBold',
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
    fontSize: 34,
    color: colors.flame,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 94, 58, 0.6)',
    textShadowRadius: 12,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
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
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
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
