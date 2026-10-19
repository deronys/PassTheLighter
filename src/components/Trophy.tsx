import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, flameGradient, fonts } from '../theme';

// The award as a glowing badge: the category emoji in a gradient ring.
export function Trophy({ emoji, size = 120 }: { emoji: string; size?: number }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.glow, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 }]} />
      <LinearGradient
        colors={[colors.gold, colors.flame, colors.flameHot]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size, borderRadius: size / 2, padding: 4 }}
      >
        <View style={[styles.inner, { borderRadius: size / 2 }]}>
          <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
        </View>
      </LinearGradient>
      <LinearGradient colors={flameGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.plate}>
        <Text style={styles.plateLabel}>WINNER</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: '-15%',
    backgroundColor: 'rgba(255, 106, 43, 0.18)',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dusk,
  },
  plate: {
    marginTop: -12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
  },
  plateLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    letterSpacing: 2,
    color: '#FFFFFF',
  },
});
