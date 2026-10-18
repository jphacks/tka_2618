import { Platform } from 'react-native';

const configuredUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_WEB_API_URL ?? 'http://localhost:8001'
  : process.env.EXPO_PUBLIC_API_URL;
const apiUrl = configuredUrl?.trim().replace(/\/+$/, '');

export type SearchCountry = { code: string; name_ja: string; flag: string; cuisine_supported: boolean };
export type Prefecture = { code: string; name_ja: string };

export async function searchApi<T>(path: string, signal: AbortSignal): Promise<T> {
  if (!apiUrl || !/^https?:\/\//.test(apiUrl)) throw new Error('APIの接続先が設定されていません。');
  const response = await fetch(`${apiUrl}${path}`, { signal });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'データを取得できませんでした。');
  }
  return payload as T;
}
