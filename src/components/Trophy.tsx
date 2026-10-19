import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

// A digital trophy with the award's emoji on a gold cup.
export function Trophy({ emoji, size = 120 }: { emoji: string; size?: number }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.cup, { width: size, height: size * 0.85, borderBottomLeftRadius: size / 2, borderBottomRightRadius: size / 2 }]}>
        <Text style={{ fontSize: size * 0.42 }}>{emoji}</Text>
      </View>
      <View style={[styles.stem, { width: size * 0.16, height: size * 0.18 }]} />
      <View style={[styles.base, { width: size * 0.7, height: size * 0.16 }]}>
        <Text style={styles.plate}>WINNER</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  cup: {
    backgroundColor: colors.gold,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F2A900',
  },
  stem: {
    backgroundColor: '#F2A900',
  },
  base: {
    backgroundColor: '#7A4B12',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
});
