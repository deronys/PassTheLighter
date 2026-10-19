// 14 Settings and 15 Friends.
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { play } from '../feedback';
import { useNav } from '../nav';
import { players, visibleTo } from '../online/rules';
import { useStore } from '../online/store';
import { colors, fonts } from '../theme';
import { Avatar, ComicButton, Panel, Screen, Title } from '../ui/kit';
import { useFlames } from './Lobby';

export function Settings() {
  const nav = useNav();
  const { state, me, setSettings, signOut, resetDemo } = useStore();
  const flames = useFlames();
  const { settings } = state;

  return (
    <Screen title="SETTINGS" onBack={nav.back} flames={flames}>
      <Panel style={styles.profile}>
        <Avatar user={me} size={64} />
        <View style={styles.grow}>
          <Text style={styles.name}>{me.name}</Text>
          <Text style={styles.small}>Signed in (demo)</Text>
        </View>
      </Panel>
      <Panel style={styles.list}>
        <Toggle label="SOUND" on={settings.sound} onChange={(sound) => setSettings({ ...settings, sound })} />
        <Toggle label="NOTIFICATIONS" on={settings.notifications} onChange={(notifications) => setSettings({ ...settings, notifications })} />
      </Panel>
      <View style={styles.buttons}>
        <ComicButton label="HOW TO PLAY" color="yellow" onPress={() => nav.push({ name: 'tutorial', fromMenu: true })} />
        <ComicButton
          label="RESET DEMO"
          color="yellow"
          onPress={() => {
            resetDemo();
            nav.reset({ name: 'splash' });
          }}
        />
        <ComicButton
          label="LOG OUT"
          onPress={() => {
            signOut();
            nav.reset({ name: 'login' });
          }}
        />
      </View>
      <Text style={styles.small}>Terms of use and privacy policy will be linked here in the real game.</Text>
    </Screen>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={() => {
        play('tap');
        onChange(!on);
      }}
      style={styles.toggleRow}
    >
      <Title size={22} color={colors.white}>
        {label}
      </Title>
      <View style={[styles.track, on && styles.trackOn]}>
        <View style={[styles.knob, on && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

export function Friends() {
  const nav = useNav();
  const { state, me } = useStore();
  const flames = useFlames();
  const friends = [...state.friends].sort((a, b) => a.name.localeCompare(b.name));
  const games = visibleTo(state.games, me.id);
  const together = (id: string) => games.filter((g) => players(g).includes(id) || g.seats.some((s) => s.userId === id)).length;

  return (
    <Screen
      title="FRIENDS"
      onBack={nav.back}
      flames={flames}
      footer={<ComicButton label="START A GAME" sound="flick" onPress={() => nav.push({ name: 'invite' })} />}
    >
      <Text style={styles.small}>{friends.length} friends play Pass The Lighter</Text>
      {friends.map((f) => (
        <Panel key={f.id} style={styles.friend}>
          <Avatar user={f} size={58} />
          <View style={styles.grow}>
            <Text style={styles.name} numberOfLines={1}>
              {f.name}
            </Text>
            <Text style={styles.small}>
              {together(f.id) ? `In ${together(f.id)} of your games` : 'No games together yet'}
            </Text>
          </View>
        </Panel>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.cyan,
  },
  small: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.muted,
  },
  list: {
    gap: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  track: {
    width: 64,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    padding: 4,
  },
  trackOn: {
    backgroundColor: colors.green,
  },
  knob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  knobOn: {
    marginLeft: 28,
  },
  buttons: {
    gap: 14,
    paddingHorizontal: 20,
  },
  friend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
});
