import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

import { play } from '../feedback';
import type { User } from '../online/rules';
import { colors } from '../theme';
import { Avatar, Title } from './kit';

type Props = {
  users: User[];
  counts: Record<string, number>;
  selected: number;
  onSelect: (index: number) => void;
};

// "Pass it to...": three players at a time with the chosen one in the middle,
// under a yellow pointer, and arrows to scroll through everyone.
export function PlayerPicker({ users, counts, selected, onSelect }: Props) {
  const n = users.length;
  const at = (offset: number) => (selected + offset + n) % n;
  const step = (dir: number) => {
    play('tap');
    onSelect(at(dir));
  };
  const side = (offset: number) => {
    const user = users[at(offset)];
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={user.name} onPress={() => step(offset)} style={styles.side}>
        <Avatar user={user} size={70} count={counts[user.id] ?? 0} label={firstWord(user.name)} />
      </Pressable>
    );
  };
  const chosen = users[selected];

  return (
    <View style={styles.wrap}>
      <Title size={34} style={styles.title}>
        PASS IT TO...
      </Title>
      <Svg width={34} height={20} style={styles.pointer}>
        <Polygon points="0,0 34,0 17,20" fill={colors.yellow} />
      </Svg>
      <View style={styles.row}>
        <Arrow dir={-1} onPress={() => step(-1)} />
        {n > 2 && side(-1)}
        <View accessibilityLabel={`Passing to ${chosen.name}`} style={styles.center}>
          <Avatar user={chosen} size={94} count={counts[chosen.id] ?? 0} selected label={firstWord(chosen.name)} />
        </View>
        {n > 1 && side(1)}
        <Arrow dir={1} onPress={() => step(1)} />
      </View>
    </View>
  );
}

const firstWord = (name: string) => name.split(' ')[0];

function Arrow({ dir, onPress }: { dir: 1 | -1; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={dir > 0 ? 'Next player' : 'Previous player'} onPress={onPress} hitSlop={10}>
      <Svg width={40} height={36} viewBox="0 0 40 36" style={dir < 0 ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Path d="M2 12 L22 12 L22 2 L38 18 L22 34 L22 24 L2 24 Z" fill={colors.white} />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  pointer: {
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  side: {
    opacity: 0.85,
    marginTop: 14,
  },
  center: {
    marginHorizontal: 4,
  },
});
