import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { QUESTIONS, categoryOf } from '../data/questions';
import { play } from '../feedback';
import { colors, fonts, nativeDriver } from '../theme';

type Props = {
  // Question indexes dealt for this turn.
  cards: number[];
  onDeal: () => void;
  // The question on the top card, or '' while the blank card is empty.
  onChange: (question: string) => void;
};

const SWIPE_DISTANCE = 70;
const BLANK = { name: 'Your own', emoji: '✏️', colors: ['#3A3350', '#1E1830'] as [string, string] };

// A hand of question cards. Swipe or use the arrows to flip through them; the
// card on top is the one you ask. The last card is blank for your own question.
export function QuestionDeck({ cards, onDeal, onChange }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(320, width - 72);
  const cardHeight = cardWidth * 1.15;
  const count = cards.length + 1;

  const [top, setTop] = useState(0);
  const [own, setOwn] = useState('');
  const dx = useRef(new Animated.Value(0)).current;
  const deal = useRef(new Animated.Value(0)).current;

  const textOf = (position: number) => (position < cards.length ? QUESTIONS[cards[position]] : own.trim());

  // A new hand: reset to the first card and deal the cards in.
  useEffect(() => {
    setTop(0);
    deal.setValue(0);
    Animated.timing(deal, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(1.4)), useNativeDriver: nativeDriver }).start();
  }, [cards, deal]);

  useEffect(() => {
    onChange(textOf(top));
    // textOf only depends on cards, own and top.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, own, cards]);

  // Ignore taps while a card is still flying off, so no flip gets lost.
  const flying = useRef(false);
  const flip = (direction: 1 | -1) => {
    if (flying.current) return;
    flying.current = true;
    play('tap');
    Animated.timing(dx, { toValue: direction * -(width + 40), duration: 180, useNativeDriver: nativeDriver }).start(() => {
      dx.setValue(0);
      setTop((t) => (t + direction + count) % count);
      flying.current = false;
    });
  };
  const flipRef = useRef(flip);
  flipRef.current = flip;

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => dx.setValue(g.dx),
        onPanResponderRelease: (_, g) => {
          if (g.dx < -SWIPE_DISTANCE) flipRef.current(1);
          else if (g.dx > SWIPE_DISTANCE) flipRef.current(-1);
          else Animated.spring(dx, { toValue: 0, useNativeDriver: nativeDriver, bounciness: 10 }).start();
        },
        onPanResponderTerminate: () => Animated.spring(dx, { toValue: 0, useNativeDriver: nativeDriver }).start(),
      }),
    [dx],
  );

  const rotate = dx.interpolate({ inputRange: [-200, 0, 200], outputRange: ['-12deg', '0deg', '12deg'] });

  // The top card plus two peeking out behind it, drawn back to front.
  const layers = [2, 1, 0].map((depth) => (top + depth) % count);

  return (
    <View style={styles.wrap}>
      <View style={{ width: cardWidth, height: cardHeight + 24 }}>
        {layers.map((position, i) => {
          const depth = 2 - i;
          const isTop = depth === 0;
          const blank = position === cards.length;
          const category = blank ? BLANK : categoryOf(cards[position]);
          const dealIn = deal.interpolate({
            inputRange: [0, 0.15 * depth, 0.6 + 0.15 * depth, 1],
            outputRange: [400, 400, 0, 0],
            extrapolate: 'clamp',
          });
          const transforms = isTop
            ? [{ translateY: dealIn }, { translateX: dx }, { rotate }]
            : [{ translateY: Animated.add(dealIn, new Animated.Value(depth * 12)) }, { scale: 1 - depth * 0.05 }, { rotate: `${depth % 2 ? 4 : -3}deg` }];

          return (
            <Animated.View
              key={`${position}-${depth}`}
              {...(isTop ? pan.panHandlers : {})}
              style={[styles.card, { width: cardWidth, height: cardHeight, transform: transforms as never }]}
            >
              <LinearGradient colors={category.colors} style={styles.cardFace}>
                <View style={styles.cardTop}>
                  <Text selectable={false} style={styles.cornerEmoji}>{category.emoji}</Text>
                  <Text selectable={false} style={styles.category}>{category.name}</Text>
                </View>
                {blank ? (
                  isTop ? (
                    <TextInput
                      style={styles.ownInput}
                      value={own}
                      onChangeText={setOwn}
                      placeholder="Write your own question…"
                      placeholderTextColor="rgba(255,255,255,0.55)"
                      multiline
                      maxLength={140}
                    />
                  ) : (
                    <Text selectable={false} style={styles.question}>Write your own</Text>
                  )
                ) : (
                  <Text selectable={false} style={styles.question} adjustsFontSizeToFit numberOfLines={6}>
                    {QUESTIONS[cards[position]]}
                  </Text>
                )}
                <Text selectable={false} style={styles.bigEmoji}>{category.emoji}</Text>
              </LinearGradient>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.controls}>
        <RoundButton label="◀" accessibilityLabel="Previous card" onPress={() => flip(-1)} />
        <View style={styles.dots}>
          {Array.from({ length: count }, (_, i) => (
            <View key={i} style={[styles.dot, i === top && styles.dotActive]} />
          ))}
        </View>
        <RoundButton label="▶" accessibilityLabel="Next card" onPress={() => flip(1)} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          play('flick');
          setOwn('');
          onDeal();
        }}
        style={({ pressed }) => [styles.deal, pressed && styles.pressed]}
      >
        <Text style={styles.dealLabel}>🎲 Deal new cards</Text>
      </Pressable>
    </View>
  );
}

function RoundButton({ label, accessibilityLabel, onPress }: { label: string; accessibilityLabel: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <Text style={styles.roundLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 14,
  },
  card: {
    position: 'absolute',
    userSelect: 'none',
    top: 0,
    left: 0,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardFace: {
    flex: 1,
    borderRadius: 26,
    padding: 22,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cornerEmoji: {
    fontSize: 22,
  },
  category: {
    fontFamily: fonts.display,
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  question: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowRadius: 6,
  },
  ownInput: {
    flex: 1,
    marginVertical: 12,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  bigEmoji: {
    alignSelf: 'flex-end',
    fontSize: 54,
    opacity: 0.9,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  round: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundLabel: {
    fontSize: 18,
    color: colors.text,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.flame,
  },
  deal: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dealLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.text,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
