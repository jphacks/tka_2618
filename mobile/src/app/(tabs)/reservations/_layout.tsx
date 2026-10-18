// 予約タブの中で画面を重ねていく「枠」です。
// 予約したお店 → 予約を作成、のように進み、ヘッダーの「←」で戻れます。

import { Stack } from 'expo-router/stack';

// 他のタブから「予約を作成」を開いたときも、下に予約一覧を置いて戻れるようにします。
export const unstable_settings = {
  initialRouteName: 'index',
};

export default function ReservationsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
