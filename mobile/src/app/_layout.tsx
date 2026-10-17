// アプリ全体のいちばん外側の「枠」です。
// (tabs) … 下にタブバーがある画面のまとまり
// camera  … タブバーなしで全画面に出す「写真を撮影」画面（あとで追加）

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
