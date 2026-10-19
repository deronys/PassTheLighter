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

export function Screen({ children, footer, centered }: Props) {
  return (
    <View style={styles.fill}>
      <LinearGradient colors={[colors.dusk, colors.night]} style={StyleSheet.absoluteFill} />
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
