import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, common } from '../theme';

type Props = {
  children: ReactNode;
  // Pinned under the scrolling content, for the main action.
  footer?: ReactNode;
  // Centers the content vertically instead of scrolling it.
  centered?: boolean;
};

// The app's background: near-black with soft glows, like club lights at the
// edge of the screen. Drawn once behind every screen and header.
export function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[colors.dusk, colors.night, colors.night]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255, 45, 111, 0.22)', 'rgba(255, 45, 111, 0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.45 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(120, 60, 255, 0)', 'rgba(120, 60, 255, 0.16)']}
        start={{ x: 0.8, y: 0.55 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

export function Screen({ children, footer, centered }: Props) {
  return (
    <View style={styles.fill}>
      {centered ? (
        <View style={[common.content, styles.fill, styles.centered]}>{children}</View>
      ) : (
        <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 10,
  },
});
