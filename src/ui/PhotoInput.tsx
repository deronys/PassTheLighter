// "Add photo" that works in phone browsers: on the web, an invisible file
// input covers the button, so the player's tap lands on the input itself and
// the phone opens its gallery. On phones and tablets it is a plain button.
import { createElement, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { type Photo, photoFromFile, pickPhoto } from '../photo';

type Props = {
  children: ReactNode;
  accessibilityLabel: string;
  onPicked: (photo: Photo) => void;
  onError: () => void;
};

export function PhotoInput({ children, accessibilityLabel, onPicked, onError }: Props) {
  if (Platform.OS !== 'web') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={() => pickPhoto().then((photo) => photo && onPicked(photo)).catch(onError)}
      >
        <View pointerEvents="none">{children}</View>
      </Pressable>
    );
  }
  return (
    <View style={styles.wrap}>
      <View pointerEvents="none">{children}</View>
      {createElement('input', {
        type: 'file',
        accept: 'image/*',
        'aria-label': accessibilityLabel,
        style: webInput,
        onChange: (e: { target: HTMLInputElement }) => {
          const input = e.target;
          const file = input.files?.[0];
          // Let the same picture be picked again later.
          input.value = '';
          if (file) photoFromFile(file).then(onPicked, onError);
        },
      })}
    </View>
  );
}

const webInput = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  cursor: 'pointer',
  fontSize: 100,
} as const;

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
});
