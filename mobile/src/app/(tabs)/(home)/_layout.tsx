// ホームタブの中で画面を重ねていく「枠」です。
// ホーム → 国名から選ぶ → 地図からお店を探す、のように進み、ヘッダーの「←」で戻れます。

import { Stack } from 'expo-router/stack';

export default function HomeStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
