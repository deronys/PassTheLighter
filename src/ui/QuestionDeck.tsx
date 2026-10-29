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

import Svg, { Path } from 'react-native-svg';

import { QUESTIONS, categoryOf } from '../data/questions';
import { play } from '../feedback';
import { colors, comicShadow, fonts, nativeDriver } from '../theme';

type Props = {
  // Question indexes drawn so far this turn. The list grows as the player swipes.
  cards: number[];
  // Draw one more card; called before the player runs out of cards ahead.
  onMore: () => void;
  // Called with the top card's question index when the player double-taps it.
  onUse: (questionIndex: number) => void;
};

const SWIPE_DISTANCE = 70;

const DOUBLE_TAP_MS = 350;

// Suggested questions as a stack of idea cards. Swipe (or use the arrows) for
// a new idea, endlessly: the deck shows every question once before any comes
// back. Double-tap the top card to copy its question into your own.
export function QuestionDeck({ cards, onMore, onUse }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(280, width - 96);
  const cardHeight = cardWidth * 0.62;
  const count = Math.max(cards.length, 1);

  const [top, setTop] = useState(0);
  const dx = useRef(new Animated.Value(0)).current;
  const deal = useRef(new Animated.Value(0)).current;

  // Deal the cards in once, when the deck appears.
  useEffect(() => {
    Animated.timing(deal, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(1.4)), useNativeDriver: nativeDriver }).start();
  }, [deal]);

  // Keep two cards waiting behind the top one.
  useEffect(() => {
    if (top + 2 >= cards.length) onMore();
  }, [top, cards.length, onMore]);

  // Ignore taps while a card is still flying off, so no flip gets lost.
  const flying = useRef(false);
  const flip = (direction: 1 | -1) => {
    if (flying.current) return;
    // Back stops at the first idea; forward never runs out.
    if (direction < 0 && top === 0) {
      Animated.spring(dx, { toValue: 0, useNativeDriver: nativeDriver }).start();
      return;
    }
    flying.current = true;
    play('tap');
    Animated.timing(dx, { toValue: direction * -(width + 40), duration: 180, useNativeDriver: nativeDriver }).start(() => {
      dx.setValue(0);
      setTop((t) => Math.max(0, t + direction));
      flying.current = false;
    });
  };
  const lastTap = useRef(0);
  const tap = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS && cards[top] !== undefined) {
      lastTap.current = 0;
      play('pop');
      onUse(cards[top]);
    } else {
      lastTap.current = now;
    }
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
  const layers = [2, 1, 0].filter((depth) => top + depth < count).map((depth) => top + depth);

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
                accessibilityLabel={isTop ? `Double-tap to use this question: ${QUESTIONS[cards[position] ?? 0]}` : undefined}
                disabled={!isTop}
                onPress={tap}
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
        <RoundButton dir={-1} accessibilityLabel="Previous idea" onPress={() => flip(-1)} />
        <Text style={styles.note}>Double-tap to use it{'\n'}Swipe for a new idea</Text>
        <RoundButton dir={1} accessibilityLabel="Next idea" onPress={() => flip(1)} />
      </View>
    </View>
  );
}

function RoundButton({ dir, accessibilityLabel, onPress }: { dir: 1 | -1; accessibilityLabel: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} hitSlop={10}>
      <Svg width={40} height={36} viewBox="0 0 40 36" style={dir < 0 ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Path d="M2 12 L22 12 L22 2 L38 18 L22 34 L22 24 L2 24 Z" fill={colors.white} />
      </Svg>
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
    borderWidth: 4,
    borderColor: colors.white,
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
    fontFamily: fonts.comic,
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.title,
    ...comicShadow,
  },
  question: {
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
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
  note: {
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.white,
    textAlign: 'center',
  },
});
