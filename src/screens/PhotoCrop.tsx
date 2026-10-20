// Choose the part of a picture that goes in your profile frame: drag it around
// and zoom in or out, then save the square shown in the frame.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

import { useNav } from '../nav';
import { useStore } from '../online/store';
import { cropPhoto } from '../photo';
import { colors, fonts } from '../theme';
import { ComicButton, Screen, Title } from '../ui/kit';

const FRAME = 260;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

type Offset = { x: number; y: number };

export function PhotoCrop({ source }: { source: string }) {
  const nav = useNav();
  const { setPhoto } = useStore();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Image.getSize(
      source,
      (width, height) => setSize({ width, height }),
      () => setFailed(true),
    );
  }, [source]);

  // The picture always covers the whole frame: at zoom 1 its short side fits the frame.
  const base = size ? FRAME / Math.min(size.width, size.height) : 1;
  const shown = size ? { width: size.width * base * zoom, height: size.height * base * zoom } : { width: FRAME, height: FRAME };
  const clamp = (o: Offset, s = shown): Offset => {
    const mx = Math.max(0, (s.width - FRAME) / 2);
    const my = Math.max(0, (s.height - FRAME) / 2);
    return { x: Math.min(mx, Math.max(-mx, o.x)), y: Math.min(my, Math.max(-my, o.y)) };
  };

  const latest = useRef({ offset, clamp });
  latest.current = { offset, clamp };
  const start = useRef<Offset>({ x: 0, y: 0 });
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          start.current = latest.current.offset;
        },
        onPanResponderMove: (_, g) => setOffset(latest.current.clamp({ x: start.current.x + g.dx, y: start.current.y + g.dy })),
      }),
    [],
  );

  const changeZoom = (next: number) => {
    const z = Math.min(MAX_ZOOM, Math.max(1, next));
    if (!size) return setZoom(z);
    const s = { width: size.width * base * z, height: size.height * base * z };
    // Keep the same point in the middle of the frame while zooming.
    setOffset(clamp({ x: (offset.x * z) / zoom, y: (offset.y * z) / zoom }, s));
    setZoom(z);
  };

  const save = async () => {
    if (!size) return;
    setSaving(true);
    try {
      const scale = base * zoom;
      const side = FRAME / scale;
      const left = shown.width / 2 - offset.x - FRAME / 2;
      const top = shown.height / 2 - offset.y - FRAME / 2;
      // Rounding must never push the square past the picture's edge.
      const width = Math.min(size.width, Math.round(side));
      const height = Math.min(size.height, Math.round(side));
      const crop = {
        originX: Math.min(size.width - width, Math.max(0, Math.round(left / scale))),
        originY: Math.min(size.height - height, Math.max(0, Math.round(top / scale))),
        width,
        height,
      };
      setPhoto(await cropPhoto(source, crop), source);
      nav.back();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  };

  return (
    <Screen
      title="YOUR PHOTO"
      onBack={nav.back}
      scroll={false}
      footer={
        <View style={styles.row}>
          <ComicButton label="CANCEL" color="yellow" onPress={nav.back} style={styles.grow} />
          <ComicButton label={saving ? 'SAVING...' : 'SAVE'} disabled={!size || saving} onPress={save} style={styles.grow} />
        </View>
      }
    >
      <Title size={22} style={styles.center}>
        DRAG TO MOVE, ZOOM TO FIT
      </Title>
      <View style={styles.stage}>
        <View style={styles.frame} {...pan.panHandlers} accessibilityLabel="Drag the picture to choose what shows in your profile frame">
          <Image
            source={{ uri: source }}
            style={{
              position: 'absolute',
              width: shown.width,
              height: shown.height,
              left: (FRAME - shown.width) / 2 + offset.x,
              top: (FRAME - shown.height) / 2 + offset.y,
            }}
            {...({ draggable: false } as object)}
          />
        </View>
      </View>
      <View style={styles.zoomRow}>
        <ZoomButton label="−" accessibilityLabel="Zoom out" onPress={() => changeZoom(zoom - ZOOM_STEP)} disabled={zoom <= 1} />
        <View style={styles.zoomTrack}>
          <View style={[styles.zoomFill, { width: `${((zoom - 1) / (MAX_ZOOM - 1)) * 100}%` }]} />
        </View>
        <ZoomButton label="+" accessibilityLabel="Zoom in" onPress={() => changeZoom(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM} />
      </View>
      {failed && <Text style={styles.hint}>Couldn't use that picture. Try another one.</Text>}
    </Screen>
  );
}

function ZoomButton({ label, accessibilityLabel, onPress, disabled }: { label: string; accessibilityLabel: string; onPress: () => void; disabled: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} disabled={disabled} style={[styles.zoomButton, disabled && styles.disabled]}>
      <Text style={styles.zoomLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grow: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  center: {
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
  },
  stage: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  // Shaped like the avatar frames everywhere else in the game.
  frame: {
    width: FRAME,
    height: FRAME,
    borderRadius: FRAME * 0.2,
    borderWidth: 5,
    borderColor: colors.white,
    overflow: 'hidden',
    backgroundColor: '#000',
    cursor: 'grab',
  } as object,
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 10,
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  zoomLabel: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 30,
    color: colors.ink,
  },
  zoomTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  zoomFill: {
    height: '100%',
    backgroundColor: colors.yellow,
  },
});
