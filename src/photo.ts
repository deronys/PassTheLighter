// Profile pictures: pick a picture, keep a reasonably small copy of it, and
// cut the square the player chose into a small JPEG for their profile.
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { Platform } from 'react-native';

const SIZE = 256;
// The kept copy of the full picture, so the player can crop it again later.
const SOURCE_MAX = 1024;

export type Photo = { uri: string; width: number; height: number };

const dataUri = (r: { base64?: string; uri: string }) => (r.base64 ? `data:image/jpeg;base64,${r.base64}` : r.uri);

// On the web the library's picker fires a synthetic click on a hidden input,
// which phone browsers can ignore. Instead, Settings puts a real (invisible)
// file input right under the player's finger (see PhotoInput), and this reads
// the chosen file. Shrinking happens on a canvas, which every phone browser has.
export function photoFromFile(file: File): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, SOURCE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve({ uri: canvas.toDataURL('image/jpeg', 0.8), width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable picture'));
    };
    img.src = url;
  });
}

// Phones and tablets: the system photo library.
export async function pickPhoto(): Promise<Photo | undefined> {
  const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  const picked = result.canceled ? undefined : result.assets[0];
  if (!picked) return undefined;
  const { uri, width, height } = picked;
  const scale = Math.min(1, SOURCE_MAX / Math.max(width, height));
  const resize = scale < 1 ? [{ resize: { width: Math.round(width * scale), height: Math.round(height * scale) } }] : [];
  const kept = await manipulateAsync(uri, resize, { base64: true, compress: 0.8, format: SaveFormat.JPEG });
  return { uri: dataUri(kept), width: kept.width, height: kept.height };
}

export type Crop = { originX: number; originY: number; width: number; height: number };

export async function cropPhoto(source: string, crop: Crop): Promise<string> {
  if (Platform.OS === 'web') return cropOnWeb(source, crop);
  const small = await manipulateAsync(source, [{ crop }, { resize: { width: SIZE, height: SIZE } }], {
    base64: true,
    compress: 0.75,
    format: SaveFormat.JPEG,
  });
  return dataUri(small);
}

function cropOnWeb(source: string, crop: Crop): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      canvas.getContext('2d')!.drawImage(img, crop.originX, crop.originY, crop.width, crop.height, 0, 0, SIZE, SIZE);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => reject(new Error('Unreadable picture'));
    img.src = source;
  });
}
