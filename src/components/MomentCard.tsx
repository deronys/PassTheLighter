import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { play } from '../feedback';
import { type GameState, REACTIONS } from '../game';
import { colors, common, fonts } from '../theme';
import { Avatar } from './Avatar';
import { Button } from './Button';

type Props = {
  state: GameState;
  index: number;
  onComment: (author: number, text: string) => void;
  onReact: (emoji: string) => void;
};

// One pass of the lighter, revealed: who asked whom, the question, the answer,
// and everyone's reactions and comments on it.
export function MomentCard({ state, index, onComment, onReact }: Props) {
  const [writing, setWriting] = useState(false);
  const [author, setAuthor] = useState<number | undefined>();
  const [text, setText] = useState('');
  const pass = state.passes[index];
  const { players } = state;
  const from = players[pass.from];
  const to = players[pass.to];

  const send = () => {
    if (author === undefined) return;
    play('pop');
    onComment(author, text);
    setText('');
    setWriting(false);
  };

  return (
    <View style={common.card}>
      <View style={styles.header}>
        <Text style={styles.number}>#{index + 1}</Text>
        <Text style={styles.who} numberOfLines={1}>
          {from.avatar} {from.name} <Text style={styles.arrow}>🔥→</Text> {to.avatar} {to.name}
        </Text>
      </View>
      <Text style={styles.question}>“{pass.question}”</Text>
      {pass.answer !== undefined && (
        <Text style={common.body}>
          {to.name} answered{' '}
          <Text style={[styles.answer, { color: players[pass.answer].color }]}>
            {players[pass.answer].avatar} {players[pass.answer].name}
          </Text>
        </Text>
      )}

      <View style={styles.reactions}>
        {REACTIONS.map((emoji) => (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={`React ${emoji}`}
            onPress={() => {
              play('pop');
              onReact(emoji);
            }}
            style={({ pressed }) => [styles.reaction, pressed && styles.reactionPressed]}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            {pass.reactions[emoji] ? <Text style={styles.reactionCount}>{pass.reactions[emoji]}</Text> : null}
          </Pressable>
        ))}
      </View>

      {pass.comments.map((comment, i) => (
        <View key={i} style={styles.comment}>
          <Text style={styles.commentAuthor}>
            {players[comment.author].avatar} {players[comment.author].name}
          </Text>
          <Text style={common.body}>{comment.text}</Text>
        </View>
      ))}

      {writing ? (
        <View style={styles.form}>
          <Text style={common.muted}>Who's commenting?</Text>
          <View style={styles.authors}>
            {players.map((player, i) => (
              <Avatar
                key={player.id}
                player={player}
                size={36}
                selected={author === i}
                dimmed={author !== undefined && author !== i}
                onPress={() => setAuthor(i)}
              />
            ))}
          </View>
          <TextInput
            style={common.input}
            value={text}
            onChangeText={setText}
            placeholder="Roast them…"
            placeholderTextColor={colors.muted}
            maxLength={140}
          />
          <Button label="Post comment" sound={null} disabled={author === undefined || text.trim().length === 0} onPress={send} />
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => setWriting(true)} style={styles.addComment}>
          <Text style={styles.addCommentLabel}>💬 Add a comment</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  number: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.muted,
  },
  who: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
  },
  arrow: {
    fontSize: 13,
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 21,
    lineHeight: 27,
    color: colors.text,
  },
  answer: {
    fontFamily: fonts.bold,
  },
  reactions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
  },
  reactionPressed: {
    transform: [{ scale: 1.15 }],
  },
  reactionEmoji: {
    fontSize: 18,
  },
  reactionCount: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  comment: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    gap: 2,
  },
  commentAuthor: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ember,
  },
  form: {
    gap: 10,
  },
  authors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  addComment: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  addCommentLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.flame,
  },
});
