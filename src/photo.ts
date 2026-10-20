// Profile pictures: pick a picture, keep a reasonably small copy of it, and
// cut the square the player chose into a small JPEG for their profile.
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';

const SIZE = 256;
// The kept copy of the full picture, so the player can crop it again later.
const SOURCE_MAX = 1024;

export type Photo = { uri: string; width: number; height: number };

const dataUri = (r: { base64?: string; uri: string }) => (r.base64 ? `data:image/jpeg;base64,${r.base64}` : r.uri);

export async function pickPhoto(): Promise<Photo | undefined> {
  const picked = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  if (picked.canceled || !picked.assets[0]) return undefined;
  const { uri, width, height } = picked.assets[0];
  const scale = Math.min(1, SOURCE_MAX / Math.max(width, height));
  const resize = scale < 1 ? [{ resize: { width: Math.round(width * scale), height: Math.round(height * scale) } }] : [];
  const kept = await manipulateAsync(uri, resize, { base64: true, compress: 0.8, format: SaveFormat.JPEG });
  return { uri: dataUri(kept), width: kept.width, height: kept.height };
}

export type Crop = { originX: number; originY: number; width: number; height: number };

export async function cropPhoto(source: string, crop: Crop): Promise<string> {
  const small = await manipulateAsync(source, [{ crop }, { resize: { width: SIZE, height: SIZE } }], {
    base64: true,
    compress: 0.75,
    format: SaveFormat.JPEG,
  });
  return dataUri(small);
}
