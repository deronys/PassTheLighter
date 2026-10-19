import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { QUESTIONS, type QuestionCategory, categoryOf } from '../data/questions';
import { buzz, play } from '../feedback';
import { type GameState, REACTIONS } from '../game';
import { colors, fonts, nativeDriver } from '../theme';
import { Avatar } from './Avatar';
import { PopIn } from './PopIn';

// One-tap comments, so roasting someone doesn't need typing.
export const QUICK_ROASTS = ['😂 No way!', '🎯 Called it', '💀 Busted', '🙈 Awkward…', '🔥 Savage', '🤥 Liar!'];

const OWN_QUESTION: QuestionCategory = { name: 'Their own question', emoji: '✏️', colors: ['#FF8A3D', '#E0442B'] };

type Props = {
  state: GameState;
  index: number;
  // Face down until tapped; already revealed secrets show straight away.
  revealed: boolean;
  onReveal: () => void;
  onComment: (author: number, text: string) => void;
  onReact: (emoji: string) => void;
};

// One pass of the lighter as a game moment: who passed to whom, a face-down
// question card that flips over, the answer, emoji reactions that float up,
// and comments as speech bubbles.
export function SecretReveal({ state, index, revealed, onReveal, onComment, onReact }: Props) {
  const pass = state.passes[index];
  const { players } = state;
  const from = players[pass.from];
  const to = players[pass.to];
  const questionIndex = QUESTIONS.indexOf(pass.question);
  const category = questionIndex >= 0 ? categoryOf(questionIndex) : OWN_QUESTION;

  // The flip: 0 → 1 squashes the card to its edge, then it opens on the other face.
  const flip = useRef(new Animated.Value(revealed ? 1 : 0)).current;
  const [faceUp, setFaceUp] = useState(revealed);
  useEffect(() => {
    flip.setValue(revealed ? 1 : 0);
    setFaceUp(revealed);
  }, [index, revealed, flip]);

  const turnOver = () => {
    if (faceUp) return;
    play('flick');
    buzz();
    Animated.timing(flip, { toValue: 0.5, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: nativeDriver }).start(() => {
      setFaceUp(true);
      onReveal();
      Animated.spring(flip, { toValue: 1, useNativeDriver: nativeDriver, bounciness: 12 }).start();
    });
  };
  const scaleX = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 1] });

  return (
    <View style={styles.wrap}>
      <PopIn trigger={index}>
        <View style={styles.passRow}>
          <Avatar player={from} size={56} />
          <View style={styles.lighterTrail}>
            <Text style={styles.trailFlame}>🔥</Text>
            <Text style={styles.trailArrow}>➜</Text>
          </View>
          <Avatar player={to} size={56} />
        </View>
      </PopIn>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={faceUp ? `Question: ${pass.question}` : 'Tap to reveal the question'}
        disabled={faceUp}
        onPress={turnOver}
      >
        <Animated.View style={[styles.card, { transform: [{ scaleX }] }]}>
          {faceUp ? (
            <LinearGradient colors={category.colors} style={styles.cardFace}>
              <View style={styles.cardTop}>
                <Text style={styles.cornerEmoji}>{category.emoji}</Text>
                <Text style={styles.category}>{category.name}</Text>
              </View>
              <Text style={styles.question}>{pass.question}</Text>
              <Text style={styles.bigEmoji}>{category.emoji}</Text>
            </LinearGradient>
          ) : (
            <LinearGradient colors={['#3B2A63', '#1C1236']} style={[styles.cardFace, styles.cardBack]}>
              <Text style={styles.backFlame}>🔥</Text>
              <Text style={styles.backLabel}>Tap to reveal</Text>
            </LinearGradient>
          )}
        </Animated.View>
      </Pressable>

      {faceUp && pass.answer !== undefined && (
        <PopIn delay={150} trigger={index}>
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>{to.name}'s answer</Text>
            <Avatar player={players[pass.answer]} size={44} />
          </View>
        </PopIn>
      )}

      {faceUp && (
        <>
          <Reactions reactions={pass.reactions} onReact={onReact} />
          <Comments state={state} index={index} onComment={onComment} />
        </>
      )}
    </View>
  );
}

function Reactions({ reactions, onReact }: { reactions: Record<string, number>; onReact: (emoji: string) => void }) {
  const [bursts, setBursts] = useState<{ id: number; emoji: string; slot: number }[]>([]);
  const nextId = useRef(0);

  const tap = (emoji: string, slot: number) => {
    play('pop');
    buzz();
    onReact(emoji);
    const id = nextId.current++;
    setBursts((b) => [...b, { id, emoji, slot }]);
  };

  return (
    <View style={styles.reactions}>
      {REACTIONS.map((emoji, slot) => (
        <Pressable
          key={emoji}
          accessibilityRole="button"
          accessibilityLabel={`React ${emoji}`}
          onPress={() => tap(emoji, slot)}
          style={({ pressed }) => [styles.reaction, pressed && styles.reactionPressed]}
        >
          <Text style={styles.reactionEmoji}>{emoji}</Text>
          {reactions[emoji] ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{reactions[emoji]}</Text>
            </View>
          ) : null}
        </Pressable>
      ))}
      {bursts.map((b) => (
        <FloatingEmoji key={b.id} emoji={b.emoji} slot={b.slot} onDone={() => setBursts((all) => all.filter((x) => x.id !== b.id))} />
      ))}
    </View>
  );
}

// An emoji that floats up from its button and fades away.
function FloatingEmoji({ emoji, slot, onDone }: { emoji: string; slot: number; onDone: () => void }) {
  const rise = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rise, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: nativeDriver }).start(onDone);
    // Runs once per floating emoji.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -130] });
  const scale = rise.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.8, 1.8, 1.2] });
  const opacity = rise.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
  return (
    <Animated.Text
      pointerEvents="none"
      style={[styles.floating, { left: slot * 60 + 10, opacity, transform: [{ translateY }, { scale }] }]}
    >
      {emoji}
    </Animated.Text>
  );
}

function Comments({ state, index, onComment }: { state: GameState; index: number; onComment: (author: number, text: string) => void }) {
  const [author, setAuthor] = useState<number | undefined>();
  const [text, setText] = useState('');
  const { players } = state;
  const pass = state.passes[index];

  useEffect(() => {
    setAuthor(undefined);
    setText('');
  }, [index]);

  const send = (message: string) => {
    if (author === undefined || message.trim().length === 0) return;
    play('pop');
    onComment(author, message.trim());
    setText('');
    setAuthor(undefined);
  };

  return (
    <View style={styles.comments}>
      {pass.comments.map((comment, i) => {
        const player = players[comment.author];
        return (
          <PopIn key={i}>
            <View style={styles.bubbleRow}>
              <Avatar player={player} size={34} showName={false} />
              <View style={[styles.bubble, { borderColor: player.color }]}>
                <Text style={[styles.bubbleName, { color: player.color }]}>{player.name}</Text>
                <Text style={styles.bubbleText}>{comment.text}</Text>
              </View>
            </View>
          </PopIn>
        );
      })}

      <Text style={styles.prompt}>{author === undefined ? '💬 Tap your face to roast' : `${players[author].name} says…`}</Text>
      <View style={styles.faces}>
        {players.map((player, i) => (
          <Avatar
            key={player.id}
            player={player}
            size={40}
            showName={false}
            selected={author === i}
            dimmed={author !== undefined && author !== i}
            onPress={() => {
              play('tap');
              setAuthor(author === i ? undefined : i);
            }}
          />
        ))}
      </View>

      {author !== undefined && (
        <PopIn trigger={author}>
          <View style={styles.composer}>
            <View style={styles.roasts}>
              {QUICK_ROASTS.map((roast) => (
                <Pressable
                  key={roast}
                  accessibilityRole="button"
                  onPress={() => send(roast)}
                  style={({ pressed }) => [styles.roast, { borderColor: players[author].color }, pressed && styles.reactionPressed]}
                >
                  <Text style={styles.roastLabel}>{roast}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { borderColor: players[author].color }]}
                value={text}
                onChangeText={setText}
                onSubmitEditing={() => send(text)}
                placeholder="…or type your own"
                placeholderTextColor={colors.muted}
                maxLength={140}
                returnKeyType="send"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send comment"
                disabled={text.trim().length === 0}
                onPress={() => send(text)}
                style={[styles.sendButton, text.trim().length === 0 && styles.sendDisabled]}
              >
                <Text style={styles.sendLabel}>➤</Text>
              </Pressable>
            </View>
          </View>
        </PopIn>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  lighterTrail: {
    alignItems: 'center',
  },
  trailFlame: {
    fontSize: 26,
  },
  trailArrow: {
    fontSize: 22,
    color: colors.flame,
    marginTop: -4,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    minHeight: 200,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardFace: {
    flex: 1,
    minHeight: 200,
    borderRadius: 22,
    padding: 18,
    gap: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  cardBack: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.flame,
  },
  backFlame: {
    fontSize: 64,
  },
  backLabel: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 1,
    color: colors.flame,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cornerEmoji: {
    fontSize: 18,
  },
  category: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowRadius: 6,
    paddingRight: 30,
  },
  bigEmoji: {
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 34,
    opacity: 0.5,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  answerLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reactions: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  reaction: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reactionPressed: {
    transform: [{ scale: 1.15 }],
  },
  reactionEmoji: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.flameHot,
  },
  badgeLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  floating: {
    position: 'absolute',
    top: 8,
    fontSize: 30,
  },
  comments: {
    gap: 10,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubble: {
    flexShrink: 1,
    borderWidth: 2,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceStrong,
  },
  bubbleName: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  bubbleText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text,
  },
  prompt: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 4,
  },
  faces: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  composer: {
    gap: 10,
  },
  roasts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  roast: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2,
    backgroundColor: colors.surfaceStrong,
  },
  roastLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.flame,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendLabel: {
    fontSize: 18,
    color: colors.onFlame,
  },
});
