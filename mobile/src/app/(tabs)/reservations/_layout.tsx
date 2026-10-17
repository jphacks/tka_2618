// 予約タブの中で画面を重ねていく「枠」です。
// 予約したお店 → 予約を作成、のように進み、ヘッダーの「←」で戻れます。

import { Stack } from 'expo-router/stack';

export default function ReservationsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
