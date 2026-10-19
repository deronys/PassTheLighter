import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
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
  // Called with the top card's question when the player picks it.
  onUse: (question: string) => void;
};

const SWIPE_DISTANCE = 70;

// A hand of idea cards. Swipe or use the arrows to flip through them, and tap
// the top card (or "Use this one") to copy its question into your own.
export function QuestionDeck({ cards, onDeal, onUse }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width - 96);
  const cardHeight = cardWidth * 0.62;
  const count = Math.max(cards.length, 1);

  const [top, setTop] = useState(0);
  const dx = useRef(new Animated.Value(0)).current;
  const deal = useRef(new Animated.Value(0)).current;

  // A new hand: reset to the first card and deal the cards in.
  useEffect(() => {
    setTop(0);
    deal.setValue(0);
    Animated.timing(deal, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(1.4)), useNativeDriver: nativeDriver }).start();
  }, [cards, deal]);

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
  const use = () => {
    if (cards.length === 0) return;
    play('pop');
    onUse(QUESTIONS[cards[top]]);
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
  const layers = [2, 1, 0].filter((depth) => depth < count).map((depth) => (top + depth) % count);

  return (
    <View style={styles.wrap}>
      <View style={{ width: cardWidth, height: cardHeight + 20 }}>
        {layers.map((position, i) => {
          const depth = layers.length - 1 - i;
          const isTop = depth === 0;
          const category = categoryOf(cards[position] ?? 0);
          const dealIn = deal.interpolate({
            inputRange: [0, 0.15 * depth, 0.6 + 0.15 * depth, 1],
            outputRange: [400, 400, 0, 0],
            extrapolate: 'clamp',
          });
          const transforms = isTop
            ? [{ translateY: dealIn }, { translateX: dx }, { rotate }]
            : [{ translateY: Animated.add(dealIn, new Animated.Value(depth * 10)) }, { scale: 1 - depth * 0.05 }, { rotate: `${depth % 2 ? 4 : -3}deg` }];

          return (
            <Animated.View
              key={`${position}-${depth}`}
              {...(isTop ? pan.panHandlers : {})}
              style={[styles.card, { width: cardWidth, height: cardHeight, transform: transforms as never }]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isTop ? `Use this question: ${QUESTIONS[cards[position] ?? 0]}` : undefined}
                disabled={!isTop}
                onPress={use}
                style={styles.fill}
              >
              <LinearGradient colors={category.colors} style={styles.cardFace}>
                <View style={styles.cardTop}>
                  <Text selectable={false} style={styles.cornerEmoji}>{category.emoji}</Text>
                  <Text selectable={false} style={styles.category}>{category.name}</Text>
                </View>
                <Text selectable={false} style={styles.question} adjustsFontSizeToFit numberOfLines={4}>
                  {QUESTIONS[cards[position] ?? 0]}
                </Text>
                <Text selectable={false} style={styles.bigEmoji}>{category.emoji}</Text>
              </LinearGradient>
              </Pressable>
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

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={use}
          style={({ pressed }) => [styles.deal, styles.useButton, pressed && styles.pressed]}
        >
          <Text style={[styles.dealLabel, styles.useLabel]}>⬆ Use this one</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            play('flick');
            onDeal();
          }}
          style={({ pressed }) => [styles.deal, pressed && styles.pressed]}
        >
          <Text style={styles.dealLabel}>🎲 New cards</Text>
        </Pressable>
      </View>
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
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  fill: {
    flex: 1,
  },
  cardFace: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'flex-start',
    gap: 8,
    overflow: 'hidden',
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
    fontSize: 21,
    lineHeight: 26,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowRadius: 6,
  },
  bigEmoji: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 12,
    bottom: 8,
    fontSize: 34,
    opacity: 0.5,
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
  useButton: {
    backgroundColor: colors.flame,
    borderColor: colors.flame,
  },
  useLabel: {
    color: colors.onFlame,
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
