import { Platform } from 'react-native';

// Taken from John's screen designs: deep teal felt, a red painted header,
// red and yellow comic buttons, dark teal panels and white speech bubbles.
export const colors = {
  teal: '#0A6966',
  panel: 'rgba(3, 47, 49, 0.93)',
  panelEdge: 'rgba(0, 0, 0, 0.35)',
  red: '#E5261B',
  redDark: '#A50F0A',
  yellow: '#FFD21F',
  yellowDark: '#E09A00',
  title: '#FFCC2E',
  // Names and highlights on the teal panels.
  cyan: '#62E0DA',
  green: '#8BE04E',
  white: '#FFFFFF',
  ink: '#3B1206',
  bubbleText: '#2A2A2A',
  muted: 'rgba(255, 255, 255, 0.7)',
};

export const fonts = {
  comic: 'LuckiestGuy_400Regular',
  body: 'Fredoka_500Medium',
  bold: 'Fredoka_600SemiBold',
};

// A dark outline and drop shadow, like the painted titles in the designs.
export const comicShadow = {
  textShadowColor: 'rgba(60, 8, 4, 0.85)',
  textShadowOffset: { width: 1.5, height: 2.5 },
  textShadowRadius: 1,
};

// The native driver is not available on web.
export const nativeDriver = Platform.OS !== 'web';
