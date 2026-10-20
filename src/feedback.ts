// Sound effects and vibration, both optional and never allowed to break the game.
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const SOURCES = {
  pop: require('../assets/sounds/pop.wav'),
  tap: require('../assets/sounds/tap.wav'),
  boom: require('../assets/sounds/boom.wav'),
  drumroll: require('../assets/sounds/drumroll.wav'),
  fanfare: require('../assets/sounds/fanfare.wav'),
};

export type Sound = keyof typeof SOURCES;

const players: Partial<Record<Sound, AudioPlayer>> = {};
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function play(sound: Sound) {
  if (muted) return;
  try {
    const player = (players[sound] ??= createAudioPlayer(SOURCES[sound]));
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Sound is a nice extra; ignore devices or browsers that refuse it.
  }
}

export function buzz(kind: 'light' | 'heavy' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  const done =
    kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
  done.catch(() => {});
}
