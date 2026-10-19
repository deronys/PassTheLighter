import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { buzz, play } from '../feedback';
import type { GameState } from '../game';
import { colors, common, nativeDriver } from '../theme';

type Props = {
  state: GameState;
  onReveal: () => void;
};

export function GameOverScreen({ state, onReveal }: Props) {
  const blast = useRef(new Animated.Value(0)).current;
  const player = state.players[state.holder];

  useEffect(() => {
    play('boom');
    buzz('heavy');
    Animated.timing(blast, { toValue: 1, duration: 900, easing: Easing.out(Easing.back(2)), useNativeDriver: nativeDriver }).start();
  }, [blast]);

  const scale = blast.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const ringScale = blast.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.4] });
  const ringOpacity = blast.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.8, 0.4, 0] });

  return (
    <Screen centered footer={<Button label="Reveal the secrets" sound="flick" onPress={onReveal} />}>
      <View style={styles.stage}>
        <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
        <Animated.View style={{ transform: [{ scale }] }}>
          <Avatar player={player} size={110} flames={3} highlighted />
        </Animated.View>
      </View>
      <Text style={[common.label, common.center]}>Third time with the lighter</Text>
      <Text style={common.title}>Game over</Text>
      <Text style={[common.muted, common.center]}>
        {player.name} got the lighter three times. Time to find out what everyone was asked.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.flameHot,
  },
});
