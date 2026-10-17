import { Stack } from 'expo-router';

export default function MapLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: '戻る' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ title: '料理の国を選ぶ' }} />
      <Stack.Screen name="prefectures" options={{ title: '都道府県を選ぶ' }} />
      <Stack.Screen name="results" options={{ title: '近くのお店' }} />
      <Stack.Screen name="visit" options={{ title: '訪問記録' }} />
    </Stack>
  );
}
