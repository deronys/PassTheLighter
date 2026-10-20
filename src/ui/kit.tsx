// The building blocks of every screen, drawn to match John's designs.
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useRef } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { buzz, play } from '../feedback';
import type { User } from '../online/rules';
import { colors, comicShadow, fonts, nativeDriver } from '../theme';

export const art = {
  background: require('../../assets/art/background.jpg'),
  header: require('../../assets/art/header.png'),
  logo: require('../../assets/art/logo.png'),
  handLighter: require('../../assets/art/hand-lighter.png'),
  flame: require('../../assets/art/flame.png'),
  burst: require('../../assets/art/lighter-burst.png'),
};

type ScreenProps = {
  title?: string;
  onBack?: () => void;
  // How many times you got the lighter in this game, on the lighter badge.
  lighters?: number;
  // Tapping the badge: the game's full history.
  onLighters?: () => void;
  // Shows the chat button, with the number of unread messages.
  onChat?: () => void;
  unread?: number;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
};

// The teal background, the red header and a pinned footer for the main buttons.
export function Screen({ title, onBack, lighters, onLighters, onChat, unread = 0, children, footer, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  // Without its own scroll, the body is held to the screen height so lists inside it can scroll.
  const body = <View style={[styles.body, !scroll && styles.bodyFixed]}>{children}</View>;
  return (
    <ImageBackground source={art.background} style={[styles.fill, styles.clip]} resizeMode="cover">
      {title !== undefined && (
        <ImageBackground source={art.header} style={[styles.header, { paddingTop: insets.top }]} resizeMode="stretch">
          <View style={styles.headerRow}>
            <View style={styles.headerSide}>
              {onBack && (
                <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} hitSlop={12}>
                  <BackArrow />
                </Pressable>
              )}
            </View>
            <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit>
              {title}
            </Text>
            <View style={[styles.headerSide, styles.headerRight]}>
              {lighters !== undefined && <LighterBadge count={lighters} onPress={onLighters} />}
            </View>
          </View>
        </ImageBackground>
      )}
      {scroll ? (
        <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.fill, styles.scroll, styles.bodyFixed]}>{body}</View>
      )}
      {footer && <View style={[styles.footer, { paddingBottom: 14 + insets.bottom }]}>{footer}</View>}
      {onChat && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={unread ? `Chat, ${unread} new` : 'Chat'}
          onPress={onChat}
          style={[styles.chatButton, { bottom: (footer ? 96 : 24) + insets.bottom }]}
        >
          <ChatIcon />
          {unread > 0 && (
            <View style={styles.unread}>
              <Text style={styles.unreadLabel}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </Pressable>
      )}
    </ImageBackground>
  );
}

function BackArrow() {
  return (
    <Svg width={46} height={34} viewBox="0 0 46 34">
      <Path d="M2 17 L20 2 L20 11 L44 11 L44 23 L20 23 L20 32 Z" fill="#7A0B07" stroke="#4A0603" strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

// The lighter in the top right corner: how many times you got it in this game.
export function LighterBadge({ count, onPress }: { count: number; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`You got the lighter ${count} ${count === 1 ? 'time' : 'times'}. Show the game history`}
      onPress={onPress}
      disabled={!onPress}
      style={styles.lighterBadge}
    >
      <Image source={art.burst} style={styles.lighterBadgeArt} resizeMode="contain" />
      <View style={styles.lighterBadgeCount}>
        <Text style={styles.lighterBadgeLabel}>x{count}</Text>
      </View>
    </Pressable>
  );
}

function ChatIcon() {
  return (
    <Svg width={34} height={32} viewBox="0 0 34 32">
      <Path d="M4 3 h26 a3 3 0 0 1 3 3 v15 a3 3 0 0 1 -3 3 h-15 l-8 7 v-7 h-3 a3 3 0 0 1 -3 -3 v-15 a3 3 0 0 1 3 -3 z" fill={colors.white} />
      <Circle cx={11} cy={13.5} r={2.5} fill={colors.red} />
      <Circle cx={17} cy={13.5} r={2.5} fill={colors.red} />
      <Circle cx={23} cy={13.5} r={2.5} fill={colors.red} />
    </Svg>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  color?: 'red' | 'yellow';
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  sound?: 'tap' | 'pop' | null;
};

// The chunky painted buttons from the designs. They squash when pressed.
export function ComicButton({ label, onPress, color = 'red', disabled, small, style, sound = 'tap' }: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to: number) => Animated.spring(scale, { toValue: to, useNativeDriver: nativeDriver, speed: 40, bounciness: 12 }).start();
  const red = color === 'red';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPressIn={() => spring(0.94)}
      onPressOut={() => spring(1)}
      onPress={() => {
        if (sound) play(sound);
        buzz();
        onPress();
      }}
      style={style}
    >
      <Animated.View style={[styles.button, red ? styles.buttonRed : styles.buttonYellow, disabled && styles.disabled, { transform: [{ scale }] }]}>
        <LinearGradient
          colors={red ? ['#FF4A36', '#D81A10'] : ['#FFF06A', '#FFC400']}
          style={[styles.buttonFace, small && styles.buttonFaceSmall]}
        >
          <View style={styles.buttonShine} />
          <Text
            style={[styles.buttonLabel, small && styles.buttonLabelSmall, red ? styles.buttonLabelRed : styles.buttonLabelYellow]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {label}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

// Yellow painted section titles, like "AND ASKED YOU".
export function Title({ children, size = 26, color = colors.title, style }: { children: ReactNode; size?: number; color?: string; style?: object }) {
  return <Text style={[styles.title, { fontSize: size, lineHeight: size * 1.15, color }, style]}>{children}</Text>;
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

type AvatarProps = {
  user: User;
  size?: number;
  // The yellow number in the corner: how many times they got the lighter.
  count?: number;
  selected?: boolean;
  // Shows the little red lighter, for whoever holds it.
  lighter?: boolean;
  label?: string;
  labelColor?: string;
};

// A player's picture: a framed tile with their initials, like the photo frames in the designs.
export function Avatar({ user, size = 72, count, selected, lighter, label, labelColor = colors.cyan }: AvatarProps) {
  const radius = size * 0.2;
  return (
    <View style={styles.avatarWrap}>
      <View
        style={[
          styles.avatarFrame,
          { width: size, height: size, borderRadius: radius, borderColor: selected ? colors.yellow : colors.white, borderWidth: selected ? 5 : 3 },
        ]}
      >
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={[styles.avatarFace, { borderRadius: radius - 3 }]} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[user.color, shade(user.color)]} style={[styles.avatarFace, { borderRadius: radius - 3 }]}>
            <Text style={[styles.avatarInitials, { fontSize: size * 0.36 }]}>{initials(user.name)}</Text>
          </LinearGradient>
        )}
        {lighter && <Image source={art.burst} style={[styles.avatarLighter, { width: size * 0.42, height: size * 0.62 }]} resizeMode="contain" />}
        {count !== undefined && (
          <View style={[styles.countBadge, { minWidth: size * 0.36, height: size * 0.36, borderRadius: size * 0.18 }]}>
            <Text style={[styles.countLabel, { fontSize: size * 0.2 }]}>{count}</Text>
          </View>
        )}
      </View>
      {label !== undefined && (
        <Text style={[styles.avatarLabel, { color: labelColor, maxWidth: size + 30 }]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
}

function shade(hex: string) {
  const h = hex.replace('#', '');
  return '#' + [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.6).toString(16).padStart(2, '0')).join('');
}

// The yellow "?" coin on speech bubbles and hidden questions.
export function QuestionCoin({ size = 52, onPress, label }: { size?: number; onPress?: () => void; label?: string }) {
  const coin = (
    <View style={[styles.coin, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.coinMark, { fontSize: size * 0.68, lineHeight: size * 0.9 }]}>?</Text>
    </View>
  );
  if (!onPress) return coin;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8}>
      {coin}
    </Pressable>
  );
}

// A white comic speech bubble holding a question.
export function SpeechBubble({ children, tail = 'left', coin }: { children: ReactNode; tail?: 'left' | 'top'; coin?: ReactNode }) {
  return (
    <View style={styles.bubbleWrap}>
      <View style={[styles.bubbleTail, tail === 'left' ? styles.bubbleTailLeft : styles.bubbleTailTop]} />
      <View style={styles.bubble}>
        <View style={styles.bubbleText}>{children}</View>
        {coin && <View style={styles.bubbleCoin}>{coin}</View>}
      </View>
    </View>
  );
}

export function BubbleText({ children }: { children: ReactNode }) {
  return <Text style={styles.bubbleLabel}>{children}</Text>;
}

// A question you can't see yet: a dashed ticket stamped "Question hidden".
export function HiddenTicket({ onPress, small }: { onPress?: () => void; small?: boolean }) {
  const ticket = (
    <View style={[styles.ticket, small && styles.ticketSmall]}>
      <LinearGradient colors={['#1FB3AC', '#0D7F7A']} style={[styles.ticketFace, small && styles.ticketFaceSmall]}>
        <View style={[styles.ticketCorner, small && { borderTopWidth: 14, borderRightWidth: 14 }]} />
        <Text style={[styles.ticketLabel, small && styles.ticketLabelSmall]}>QUESTION{'\n'}HIDDEN</Text>
      </LinearGradient>
      <View style={[styles.ticketCoin, small && styles.ticketCoinSmall]}>
        <QuestionCoin size={small ? 30 : 58} />
      </View>
    </View>
  );
  if (!onPress) return ticket;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Hidden question. Burn it to reveal it." onPress={onPress}>
      {ticket}
    </Pressable>
  );
}

// The headline panel of a move: who passed the lighter to whom.
export function PassBanner({ left, right, children, burst = true, tag }: { left?: ReactNode; right?: ReactNode; children: ReactNode; burst?: boolean; tag?: ReactNode }) {
  return (
    <Panel style={styles.banner}>
      {left}
      {left && <CurvedArrow />}
      <View style={styles.bannerText}>{children}</View>
      {right}
      {burst && !right && <Image source={art.burst} style={styles.bannerBurst} resizeMode="contain" />}
      {tag && <View style={styles.bannerTag}>{tag}</View>}
    </Panel>
  );
}

function CurvedArrow() {
  return (
    <View style={styles.curvedArrow} pointerEvents="none">
      <Svg width={60} height={36} viewBox="0 0 60 36">
        <Path d="M4 30 Q 20 6 44 12" stroke={colors.cyan} strokeWidth={7} fill="none" strokeLinecap="round" />
        <Polygon points="40,2 58,14 40,24" fill={colors.cyan} />
      </Svg>
    </View>
  );
}

// The red "LEARN WHY" tag hanging off the banner.
export function Tag({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.tag}>
      <Text style={styles.tagLabel}>{label}</Text>
    </Pressable>
  );
}

// A stopwatch with minutes and seconds in yellow boxes.
export function Countdown({ ms, caption }: { ms: number; caption?: string }) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const min = String(Math.floor(total / 60)).padStart(2, '0');
  const sec = String(total % 60).padStart(2, '0');
  return (
    <View style={styles.countdown}>
      {caption && <Text style={styles.countdownCaption}>{caption}</Text>}
      <View style={styles.countdownRow}>
        <Svg width={58} height={64} viewBox="0 0 58 64">
          <Rect x={23} y={0} width={12} height={8} rx={2} fill={colors.yellow} />
          <Circle cx={29} cy={36} r={25} fill={colors.yellow} stroke="#7A3B00" strokeWidth={3} />
          <Circle cx={29} cy={36} r={18} fill={colors.red} />
          <Path d="M29 36 L29 22 M29 36 L39 40" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
        </Svg>
        <TimeBox value={min} unit="MIN" />
        <View style={styles.colon}>
          <View style={styles.colonDot} />
          <View style={styles.colonDot} />
        </View>
        <TimeBox value={sec} unit="SEC" />
      </View>
    </View>
  );
}

function TimeBox({ value, unit }: { value: string; unit: string }) {
  return (
    <LinearGradient colors={['#FFF06A', '#FFC400']} style={styles.timeBox}>
      <Text style={styles.timeValue}>{value}</Text>
      <Text style={styles.timeUnit}>{unit}</Text>
    </LinearGradient>
  );
}

// The yellow star burst behind "You have the lighter!".
export function Burst({ size = 120 }: { size?: number }) {
  const points = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? size * 0.28 : size * 0.5;
    const a = (Math.PI * 2 * i) / 24;
    return `${size / 2 + r * Math.cos(a)},${size / 2 + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <Svg width={size} height={size}>
      <Polygon points={points} fill={colors.yellow} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  // The background picture is taller than most phones; don't let it make the page scroll.
  clip: {
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    minHeight: 62,
  },
  headerSide: {
    width: 64,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.comic,
    fontSize: 28,
    color: colors.title,
    ...comicShadow,
  },
  lighterBadge: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lighterBadgeArt: {
    width: 52,
    height: 60,
  },
  lighterBadgeCount: {
    position: 'absolute',
    right: -4,
    bottom: 0,
    minWidth: 30,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 5,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lighterBadgeLabel: {
    fontFamily: fonts.comic,
    fontSize: 15,
    color: colors.ink,
    marginTop: 2,
  },
  chatButton: {
    position: 'absolute',
    right: 16,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.red,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  unread: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadLabel: {
    fontFamily: fonts.comic,
    fontSize: 13,
    color: colors.ink,
    marginTop: 2,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
  },
  body: {
    flexGrow: 1,
    gap: 18,
  },
  bodyFixed: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 10,
  },
  button: {
    borderRadius: 24,
    borderBottomWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonRed: {
    borderBottomColor: colors.redDark,
    backgroundColor: colors.redDark,
  },
  buttonYellow: {
    borderBottomColor: colors.yellowDark,
    backgroundColor: colors.yellowDark,
  },
  buttonFace: {
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonFaceSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonShine: {
    position: 'absolute',
    top: 4,
    left: 14,
    right: 14,
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  buttonLabel: {
    fontFamily: fonts.comic,
    fontSize: 28,
    letterSpacing: 0.5,
  },
  buttonLabelSmall: {
    fontSize: 20,
  },
  buttonLabelRed: {
    color: colors.yellow,
    ...comicShadow,
  },
  buttonLabelYellow: {
    color: colors.ink,
  },
  disabled: {
    opacity: 0.45,
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    fontFamily: fonts.comic,
    ...comicShadow,
  },
  avatarWrap: {
    alignItems: 'center',
    gap: 4,
  },
  avatarFrame: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  avatarFace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fonts.comic,
    color: colors.white,
    ...comicShadow,
  },
  avatarLighter: {
    position: 'absolute',
    right: '-26%',
    bottom: '-14%',
  },
  avatarLabel: {
    fontFamily: fonts.body,
    fontSize: 17,
  },
  countBadge: {
    position: 'absolute',
    top: '-16%',
    right: '-16%',
    paddingHorizontal: 4,
    backgroundColor: colors.yellow,
    borderWidth: 2,
    borderColor: '#7A3B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLabel: {
    fontFamily: fonts.comic,
    color: colors.ink,
    marginTop: 2,
  },
  coin: {
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: '#5A2A00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  coinMark: {
    fontFamily: fonts.comic,
    color: '#3B2200',
    marginTop: 4,
  },
  bubbleWrap: {
    paddingLeft: 10,
  },
  bubble: {
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingVertical: 16,
    paddingLeft: 18,
    paddingRight: 70,
    minHeight: 92,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  bubbleText: {
    flexShrink: 1,
  },
  bubbleLabel: {
    fontFamily: fonts.body,
    fontSize: 21,
    lineHeight: 28,
    color: colors.bubbleText,
  },
  bubbleCoin: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  bubbleTail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    zIndex: 1,
  },
  bubbleTailLeft: {
    left: 0,
    top: 26,
    borderTopWidth: 10,
    borderBottomWidth: 14,
    borderRightWidth: 16,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: colors.white,
  },
  bubbleTailTop: {
    right: 40,
    top: -16,
    borderLeftWidth: 8,
    borderRightWidth: 14,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.white,
  },
  ticket: {
    paddingTop: 14,
    paddingRight: 14,
  },
  ticketSmall: {
    paddingTop: 8,
    paddingRight: 8,
  },
  ticketFace: {
    borderRadius: 26,
    borderWidth: 4,
    borderColor: colors.yellow,
    borderStyle: 'dashed',
    paddingVertical: 18,
    paddingHorizontal: 22,
    minHeight: 96,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ticketFaceSmall: {
    borderRadius: 16,
    borderWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 64,
  },
  ticketCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopWidth: 26,
    borderRightWidth: 26,
    borderTopColor: '#E9F7F6',
    borderRightColor: 'transparent',
  },
  ticketLabel: {
    fontFamily: fonts.comic,
    fontSize: 30,
    lineHeight: 34,
    color: colors.white,
    transform: [{ rotate: '-9deg' }],
    marginLeft: 26,
    ...comicShadow,
  },
  ticketLabelSmall: {
    fontSize: 17,
    lineHeight: 20,
    marginLeft: 10,
  },
  ticketCoin: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  ticketCoinSmall: {
    top: -2,
    right: -2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 120,
  },
  bannerText: {
    flex: 1,
  },
  bannerBurst: {
    width: 92,
    height: 130,
    marginVertical: -20,
    marginRight: -10,
  },
  bannerTag: {
    position: 'absolute',
    right: -6,
    bottom: -18,
  },
  curvedArrow: {
    position: 'absolute',
    left: 70,
    top: -18,
  },
  tag: {
    backgroundColor: colors.red,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    transform: [{ rotate: '-8deg' }],
    borderBottomWidth: 3,
    borderBottomColor: colors.redDark,
  },
  tagLabel: {
    fontFamily: fonts.comic,
    fontSize: 18,
    color: colors.yellow,
    ...comicShadow,
  },
  countdown: {
    alignItems: 'center',
    gap: 6,
  },
  countdownCaption: {
    fontFamily: fonts.comic,
    fontSize: 20,
    color: colors.white,
    ...comicShadow,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 3,
    borderColor: '#5A2A00',
  },
  timeValue: {
    fontFamily: fonts.comic,
    fontSize: 40,
    color: colors.red,
  },
  timeUnit: {
    fontFamily: fonts.comic,
    fontSize: 18,
    color: colors.red,
  },
  colon: {
    gap: 8,
  },
  colonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.yellow,
  },
});
