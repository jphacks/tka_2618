// アプリ全体のいちばん外側の「枠」です。
// (tabs) … 下にタブバーがある画面のまとまり
// camera  … タブバーなしで全画面に出す「写真を撮影」画面
//
// AppDataProvider で、予約や記録をすべての画面で共有しています。

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { AppDataProvider } from '../data/AppDataContext';

export default function RootLayout() {
  return (
    <AppDataProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </AppDataProvider>
  );
}
