import { Stack } from 'expo-router';

export default function VisitsLayout() {
  return <Stack screenOptions={{ headerBackTitle: '戻る', title: '訪問記録' }} />;
}
