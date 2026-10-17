import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PhotoCaptureResult =
  | { status: 'captured'; uri: string }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

function fileExtension(uri: string) {
  const cleanUri = uri.split('?')[0];
  const match = cleanUri.match(/\.[a-zA-Z0-9]+$/);
  return match?.[0] ?? '.jpg';
}

async function persistNativePhoto(uri: string) {
  const directory = new Directory(Paths.document, 'visit-photos');
  directory.create({ idempotent: true, intermediates: true });
  const destination = new File(directory, `visit-${Date.now()}${fileExtension(uri)}`);
  await new File(uri).copy(destination, { overwrite: true });
  return destination.uri;
}

export async function captureVisitPhoto(): Promise<PhotoCaptureResult> {
  try {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return { status: 'error', message: '写真を撮るにはカメラの使用を許可してください。' };
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.6,
      base64: Platform.OS === 'web',
    });
    if (result.canceled) return { status: 'cancelled' };
    const asset = result.assets[0];
    if (!asset) return { status: 'error', message: '撮影した写真を読み込めませんでした。' };
    if (Platform.OS === 'web' && asset.base64) {
      return { status: 'captured', uri: `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` };
    }
    if (Platform.OS === 'web') return { status: 'captured', uri: asset.uri };
    return { status: 'captured', uri: await persistNativePhoto(asset.uri) };
  } catch {
    return { status: 'error', message: '写真を保存できませんでした。もう一度お試しください。' };
  }
}
