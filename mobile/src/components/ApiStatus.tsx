// バックエンド（API）につながるかを確認する部品です。
// 以前の App.tsx にあった接続確認を、そのまま部品にしました。設定画面で使っています。

import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Connection =
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const configuredApiUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_WEB_API_URL ?? 'http://localhost:8001'
  : process.env.EXPO_PUBLIC_API_URL;
const apiUrl = configuredApiUrl?.trim().replace(/\/+$/, '');
const initialConnection: Connection = apiUrl && /^https?:\/\//.test(apiUrl)
  ? { status: 'loading' }
  : { status: 'error', message: 'mobile/.envにAPIのURL（モバイルはEXPO_PUBLIC_API_URL、WebはEXPO_PUBLIC_WEB_API_URL）を設定し、アプリを再読み込みしてください。' };

export function ApiStatus() {
  const [connection, setConnection] = useState<Connection>(initialConnection);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initialConnection.status === 'error') return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let active = true;

    async function connect() {
      try {
        const response = await fetch(`${apiUrl}/api/hello`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') {
          throw new Error('APIのレスポンスが不正です');
        }
        if (active) setConnection({ status: 'success', message: data.message });
      } catch {
        if (active) setConnection({ status: 'error', message: '接続できませんでした。APIのURL、バックエンドの起動状態、Wi-Fi接続を確認してください。' });
      } finally {
        clearTimeout(timeout);
      }
    }
    void connect();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  const loading = connection.status === 'loading';
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>バックエンド接続</Text>
      {loading && <ActivityIndicator color="#215a49" style={styles.spinner} />}
      <Text accessibilityLiveRegion="polite" style={[styles.message, connection.status === 'error' ? styles.error : styles.success]}>
        {loading ? '接続を確認しています…' : connection.message}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
        disabled={loading}
        onPress={() => {
          setConnection(initialConnection);
          setAttempt(value => value + 1);
        }}
        style={({ pressed }) => [styles.button, (loading || pressed) && styles.dimmed]}
      >
        <Text style={styles.buttonText}>再接続</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce5df', borderRadius: 16, padding: 24 },
  heading: { color: '#19312c', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  spinner: { alignSelf: 'flex-start', marginBottom: 12 },
  message: { fontSize: 16, lineHeight: 27, marginBottom: 20 },
  success: { color: '#17613d' },
  error: { color: '#b33030' },
  button: { backgroundColor: '#215a49', minHeight: 48, borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  dimmed: { opacity: 0.5 },
});
