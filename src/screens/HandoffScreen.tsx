import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Lighter } from '../components/Lighter';
import { PopIn } from '../components/PopIn';
import { Screen } from '../components/Screen';
import type { Player } from '../game';
import { colors, common } from '../theme';

type Props = {
  player: Player;
  lead: string;
  top?: ReactNode;
  onReady: () => void;
};

// Shown whenever the phone changes hands, so nobody sees the previous player's screen.
export function HandoffScreen({ player, lead, top, onReady }: Props) {
  return (
    <Screen footer={<Button label={`I'm ${player.name}`} sound="flick" onPress={onReady} />}>
      {top}
      <View style={styles.middle}>
        <PopIn trigger={player.id}>
          <View style={styles.stack}>
            <Lighter size={130} />
            <Text style={[common.muted, common.center, styles.lead]}>{lead}</Text>
            <Avatar player={player} size={96} showName={false} highlighted />
            <Text style={[common.title, styles.name]}>{player.name}</Text>
            <Text style={[common.muted, common.center]}>Only {player.name} should look at the screen.</Text>
          </View>
        </PopIn>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  middle: {
    paddingTop: 12,
  },
  stack: {
    alignItems: 'center',
    gap: 12,
  },
  lead: {
    fontSize: 16,
  },
  name: {
    fontSize: 40,
    color: colors.text,
  },
});
