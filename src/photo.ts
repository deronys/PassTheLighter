// Picks a profile picture and shrinks it to a small square JPEG, small enough
// to keep with the profile on the phone (and later on the server).
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';

const SIZE = 256;

export async function pickProfilePhoto(): Promise<string | undefined> {
  const picked = await launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 });
  if (picked.canceled || !picked.assets[0]) return undefined;
  const { uri, width, height } = picked.assets[0];
  // Crop to the middle square (the web picker can't crop), then resize.
  const side = Math.min(width, height);
  const actions = [
    ...(width && height && width !== height ? [{ crop: { originX: (width - side) / 2, originY: (height - side) / 2, width: side, height: side } }] : []),
    { resize: { width: SIZE, height: SIZE } },
  ];
  const small = await manipulateAsync(uri, actions, { base64: true, compress: 0.7, format: SaveFormat.JPEG });
  return small.base64 ? `data:image/jpeg;base64,${small.base64}` : small.uri;
}
