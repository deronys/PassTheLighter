// A game's chat, open to its players before, during and after the game.
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewInstance, StyleSheet, Text, TextInput, View } from 'react-native';

import { play } from '../feedback';
import { useNav } from '../nav';
import { firstName } from '../online/demo';
import { players } from '../online/rules';
import { useStore } from '../online/store';
import { colors, comicShadow, fonts } from '../theme';
import { Avatar, ComicButton, Screen } from '../ui/kit';
import { useGameBar } from './gameBar';

export function Chat({ id }: { id: string }) {
  const nav = useNav();
  const { game, me, user, chat, seeChat } = useStore();
  const bar = useGameBar(game(id));
  const [text, setText] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);
  const g = game(id);
  const count = g?.chat.length ?? 0;

  // Everything shown here counts as read; keep the newest message in view.
  useEffect(() => {
    seeChat(id);
    const timer = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, count]);

  if (!g) {
    return (
      <Screen title="CHAT" onBack={nav.back}>
        <Text style={styles.hint}>This game is no longer available.</Text>
      </Screen>
    );
  }
  const canWrite = players(g).includes(me.id);
  const send = () => {
    if (!text.trim()) return;
    play('pop');
    chat(id, text);
    setText('');
  };

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        title="CHAT"
        onBack={nav.back}
        {...bar}
        onChat={undefined}
        scroll={false}
        footer={
          canWrite ? (
            <View style={styles.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Say something..."
                placeholderTextColor="#8A8A8A"
                style={styles.input}
                maxLength={200}
                onSubmitEditing={send}
                returnKeyType="send"
              />
              <ComicButton label="SEND" small sound={null} disabled={!text.trim()} onPress={send} />
            </View>
          ) : undefined
        }
      >
        <Text style={styles.gameName}>{g.name.toUpperCase()}</Text>
        <ScrollView ref={scroll} style={styles.fill} contentContainerStyle={styles.list}>
          {g.chat.length === 0 && <Text style={styles.hint}>No messages yet. Say hi to the group!</Text>}
          {g.chat.map((m, i) => {
            const mine = m.from === me.id;
            const sameAsBefore = g.chat[i - 1]?.from === m.from;
            return (
              <View key={i} style={[styles.row, mine && styles.rowMine]}>
                {!mine && <View style={styles.avatarSlot}>{!sameAsBefore && <Avatar user={user(m.from)} size={38} />}</View>}
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  {!mine && !sameAsBefore && <Text style={styles.name}>{firstName(user(m.from))}</Text>}
                  <Text style={styles.text}>{m.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  gameName: {
    fontFamily: fonts.comic,
    fontSize: 18,
    color: colors.cyan,
    textAlign: 'center',
    ...comicShadow,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  list: {
    gap: 6,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  avatarSlot: {
    width: 38,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  bubbleMine: {
    backgroundColor: colors.yellow,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.red,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.bubbleText,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.bubbleText,
  },
});
