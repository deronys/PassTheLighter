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
// which phone browsers ignore, so "Add photo" did nothing on a phone. A real
// click() on an input that is in the page, inside the tap, opens the gallery.
function pickOnWeb(): Promise<{ uri: string; width: number; height: number } | undefined> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.position = 'fixed';
    input.style.left = '-1000px';
    input.style.opacity = '0';
    document.body.appendChild(input);
    const done = () => input.remove();
    input.addEventListener('cancel', () => {
      done();
      resolve(undefined);
    });
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      done();
      if (!file) return resolve(undefined);
      const uri = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ uri, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Unreadable picture'));
      img.src = uri;
    });
    input.click();
  });
}

export async function pickPhoto(): Promise<Photo | undefined> {
  let picked: { uri: string; width: number; height: number } | undefined;
  if (Platform.OS === 'web') {
    picked = await pickOnWeb();
  } else {
    const result = await launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    picked = result.canceled ? undefined : result.assets[0];
  }
  if (!picked) return undefined;
  const { uri, width, height } = picked;
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
