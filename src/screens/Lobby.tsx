// 05 Game list, 06 Invite friends, 07 Waiting room and 07b Invitation.
import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, type ScrollViewInstance, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { type Game, MAX_PLAYERS, MIN_PLAYERS, canStart, players, receives, roleOf, visibleTo } from '../online/rules';
import { useStore } from '../online/store';
import { useGameBar } from './gameBar';
import { colors, comicShadow, fonts } from '../theme';
import { Avatar, ComicButton, Panel, Screen, Title } from '../ui/kit';

export function ago(ms: number) {
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min. ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ${h === 1 ? 'hour' : 'hours'} ago`;
  const d = Math.floor(h / 24);
  return `${d} ${d === 1 ? 'day' : 'days'} ago`;
}

const STATUS: Record<string, { label: string; color: string }> = {
  invited: { label: 'INVITED', color: colors.yellow },
  waiting: { label: 'WAITING', color: colors.yellow },
  starter: { label: 'YOUR MOVE', color: colors.green },
  holder: { label: 'YOUR MOVE', color: colors.green },
  lastPasser: { label: 'ACTIVE', color: colors.green },
  watcher: { label: 'ACTIVE', color: colors.green },
  finished: { label: 'FINISHED', color: '#FF4A36' },
};

export function GameList() {
  const nav = useNav();
  const { state, me, user, now, remove } = useStore();
  const games = visibleTo(state.games, me.id);

  return (
    <Screen title="GAME LIST" onBack={nav.back}>
      <View style={styles.center}>
        <ComicButton label="CREATE GAME" sound={null} onPress={() => nav.push({ name: 'invite' })} style={styles.create} />
      </View>
      {games.length === 0 && <Text style={styles.empty}>No games yet. Create one and invite your friends!</Text>}
      {games.map((game, i) => {
        const host = user(game.hostId);
        const role = roleOf(game, me.id);
        const status = role === 'finished' && !game.votes[me.id] && players(game).includes(me.id) ? { label: 'VOTE NOW!', color: colors.yellow } : STATUS[role];
        const hostOnRight = i % 2 === 1;
        const hostBlock = (
          <View style={styles.host}>
            {hostOnRight && <HostLabel name={firstName(host)} />}
            <Avatar user={host} size={80} lighter={game.holder === host.id} />
            {!hostOnRight && <HostLabel name={firstName(host)} />}
          </View>
        );
        return (
          <Pressable
            key={game.id}
            accessibilityRole="button"
            accessibilityLabel={`${game.name}, ${status.label.toLowerCase()}`}
            // Without the lighter, a running game opens on its history, to see where it stands.
            onPress={() => nav.push(role === 'watcher' || role === 'lastPasser' ? { name: 'progress', id: game.id } : { name: 'game', id: game.id })}
          >
            <Panel style={styles.gameCard}>
              {!hostOnRight && hostBlock}
              <View style={styles.gameInfo}>
                <Text style={styles.gameName} numberOfLines={1}>
                  {game.name.toUpperCase()}
                </Text>
                <Text style={styles.gameLine}>
                  Players: <Text style={styles.gameValue}>{players(game).length}</Text>
                </Text>
                <Text style={styles.gameLine}>
                  Last move: <Text style={styles.gameValue}>{ago(now - game.lastMoveAt)}</Text>
                </Text>
                {game.status !== 'waiting' && (
                  <Text style={styles.gameLine}>
                    Your lighters: <Text style={styles.gameValue}>{receives(game)[me.id] ?? 0}</Text>
                  </Text>
                )}
                <View style={styles.statusPill}>
                  <Text style={styles.gameLine}>
                    Game status: <Text style={{ color: status.color }}>{status.label}</Text>
                  </Text>
                </View>
              </View>
              {hostOnRight && hostBlock}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={game.hostId === me.id && game.status !== 'finished' ? `End ${game.name}` : `Remove ${game.name}`}
                onPress={() => remove(game.id)}
                hitSlop={8}
                style={styles.remove}
              >
                <Svg width={34} height={34} viewBox="0 0 34 34">
                  <Path d="M17 1 a16 16 0 1 0 0.01 0 z" fill={colors.red} stroke={colors.white} strokeWidth={2.5} />
                  <Path d="M11 11 L23 23 M23 11 L11 23" stroke={colors.white} strokeWidth={4.5} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </Panel>
          </Pressable>
        );
      })}
    </Screen>
  );
}

function HostLabel({ name }: { name: string }) {
  return (
    <Text style={styles.hostLabel}>
      <Text style={styles.hostWord}>HOST:{'\n'}</Text>
      {name}
    </Text>
  );
}

const GAME_NAMES = ['Friday Night', 'Dirty Secrets', 'Truth Hour', 'Spill The Tea', 'Burn Notice', 'No Filter', 'Hot Seat', 'Late Night Truths'];

export function InviteFriends() {
  const nav = useNav();
  const { state, create } = useStore();
  const [shown, setShown] = useState(8);
  const [picked, setPicked] = useState<string[]>([]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState(GAME_NAMES[Math.floor(Math.random() * GAME_NAMES.length)]);
  const scroll = useRef<ScrollViewInstance>(null);
  const rows = useRef<Record<string, number>>({});
  const friends = useMemo(() => [...state.friends].sort((a, b) => a.name.localeCompare(b.name)), [state.friends]);
  const visible = friends.slice(0, shown);
  const needed = MIN_PLAYERS - 1;
  const full = picked.length >= MAX_PLAYERS - 1;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : full ? p : [...p, id]));
  const jump = (letter: string) => {
    const f = visible.find((x) => x.name.toUpperCase().startsWith(letter));
    if (f && rows.current[f.id] !== undefined) scroll.current?.scrollTo({ y: rows.current[f.id], animated: true });
  };

  return (
    <Screen
      title="INVITE FRIENDS"
      onBack={nav.back}
     
      scroll={false}
      footer={
        <View style={styles.row}>
          <ComicButton
            label="MORE FRIENDS"
            small
            color="yellow"
            disabled={shown >= friends.length}
            onPress={() => setShown((n) => n + 8)}
            style={styles.grow}
          />
          <ComicButton label="INVITE" small color="yellow" disabled={picked.length < needed} onPress={() => setNaming(true)} style={styles.grow} />
        </View>
      }
    >
      <Text style={styles.hint}>
        {picked.length < needed ? `Pick at least ${needed} friends (${picked.length} picked)` : `${picked.length} friends picked`}
      </Text>
      <View style={styles.inviteBody}>
        <ScrollView ref={scroll} style={styles.grow} contentContainerStyle={styles.friendList}>
          {visible.map((f) => {
            const on = picked.includes(f.id);
            const stars = Math.round(1 + (f.id.charCodeAt(f.id.length - 1) % 5));
            return (
              <Pressable
                key={f.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={f.name}
                onPress={() => toggle(f.id)}
                onLayout={(e) => (rows.current[f.id] = e.nativeEvent.layout.y)}
              >
                <Panel style={styles.friendRow}>
                  <Avatar user={f} size={66} lighter />
                  <View style={styles.grow}>
                    <Text style={styles.friendName} numberOfLines={1}>
                      {f.name}
                    </Text>
                    <Text style={styles.stars}>
                      {'★'.repeat(stars)}
                      <Text style={styles.starsOff}>{'★'.repeat(5 - stars)}</Text>
                    </Text>
                  </View>
                  {on && (
                    <Svg width={46} height={40} viewBox="0 0 46 40">
                      <Path d="M3 22 L16 35 L43 4" stroke="#2E7D1E" strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M3 22 L16 35 L43 4" stroke={colors.green} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </Panel>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.index}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
            <Pressable key={l} onPress={() => jump(l)} hitSlop={3}>
              <Text style={styles.indexLetter}>{l}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Modal visible={naming} transparent animationType="fade" onRequestClose={() => setNaming(false)}>
        <View style={styles.modalBack}>
          <Panel style={styles.modal}>
            <Title size={26}>NAME YOUR GAME</Title>
            <TextInput value={name} onChangeText={setName} style={styles.input} maxLength={24} autoFocus />
            <ComicButton
              label="SEND INVITES"
              sound={null}
              disabled={!name.trim()}
              onPress={() => {
                setNaming(false);
                const id = create(name.trim(), picked);
                nav.replace({ name: 'game', id });
              }}
            />
            <ComicButton label="CANCEL" color="yellow" small onPress={() => setNaming(false)} />
          </Panel>
        </View>
      </Modal>
    </Screen>
  );
}

const SEAT_STATUS = {
  accepted: { label: 'ACCEPTED', color: colors.green },
  declined: { label: 'DECLINED', color: '#FF3B30' },
  invited: { label: 'WAITING', color: colors.yellow },
};

// 07 and 07b: the lobby, with Start for the host or Accept/Reject for an invitation.
export function WaitingRoom({ game }: { game: Game }) {
  const nav = useNav();
  const { me, user, start, respond } = useStore();
  const bar = useGameBar(game);
  const invited = roleOf(game, me.id) === 'invited';
  const isHost = game.hostId === me.id;
  const accepted = players(game).length;

  const footer = invited ? (
    <View style={styles.row}>
      <ComicButton label="ACCEPT" sound="pop" onPress={() => respond(game.id, true)} style={styles.grow} />
      <ComicButton
        label="REJECT"
        color="yellow"
        onPress={() => {
          respond(game.id, false);
          nav.back();
        }}
        style={styles.grow}
      />
    </View>
  ) : isHost ? (
    <ComicButton label="START GAME" sound={null} disabled={!canStart(game)} onPress={() => start(game.id)} />
  ) : undefined;

  return (
    <Screen title="WAITING ROOM" onBack={nav.back} footer={footer} {...bar}>
      {invited ? (
        <View style={styles.inviteHead}>
          <Avatar user={user(game.hostId)} size={80} label={firstName(user(game.hostId))} labelColor={colors.title} />
          <View style={styles.grow}>
            <Title size={20} color={colors.white}>
              INVITES YOU TO "{game.name.toUpperCase()}"
            </Title>
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.gameTitle}>{game.name.toUpperCase()}</Text>
        </View>
      )}
      <Text style={styles.hint}>
        {canStart(game)
          ? isHost
            ? 'Enough players are in. Start whenever you like!'
            : `Waiting for ${firstName(user(game.hostId))} to start the game.`
          : `${accepted} of at least ${MIN_PLAYERS} players have accepted.`}
      </Text>
      <View style={styles.seats}>
        {game.seats.map((seat) => {
          const s = SEAT_STATUS[seat.status];
          const u = user(seat.userId);
          return (
            <Panel key={seat.userId} style={styles.seat}>
              <Avatar user={u} size={58} />
              <View style={styles.grow}>
                <Text style={styles.seatName} numberOfLines={1}>
                  {seat.userId === me.id ? 'You' : firstName(u)}
                </Text>
                <Text style={[styles.seatStatus, { color: s.color }]}>{s.label}</Text>
              </View>
              <View style={[styles.light, { backgroundColor: s.color }]} />
            </Panel>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
  create: {
    minWidth: 260,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  host: {
    alignItems: 'center',
    gap: 6,
  },
  hostLabel: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  hostWord: {
    color: colors.cyan,
  },
  gameInfo: {
    flex: 1,
    gap: 3,
  },
  gameName: {
    fontFamily: fonts.bold,
    fontSize: 21,
    color: colors.title,
    paddingRight: 30,
  },
  gameLine: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.title,
  },
  gameValue: {
    color: colors.white,
  },
  statusPill: {
    marginTop: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  remove: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  banner: {
    height: 54,
    backgroundColor: '#3FD0D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  bannerLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: '#0A3A3C',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  grow: {
    flex: 1,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  inviteBody: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    gap: 6,
  },
  friendList: {
    gap: 12,
    paddingBottom: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    paddingVertical: 12,
  },
  friendName: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.title,
  },
  stars: {
    fontSize: 24,
    color: colors.yellow,
    letterSpacing: 2,
  },
  starsOff: {
    color: 'rgba(255,255,255,0.3)',
  },
  index: {
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  indexLetter: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  modalBack: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    gap: 14,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.bubbleText,
  },
  inviteHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  gameTitle: {
    fontFamily: fonts.comic,
    fontSize: 22,
    color: colors.cyan,
    marginBottom: 6,
    ...comicShadow,
  },
  seats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  seat: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  seatName: {
    fontFamily: fonts.body,
    fontSize: 19,
    color: colors.title,
  },
  seatStatus: {
    fontFamily: fonts.body,
    fontSize: 15,
  },
  light: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
  },
});
