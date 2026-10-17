// アプリ全体の「枠」です。下にタブバーを置き、タブで画面を切り替えます。
// src/app/ の中のファイル1つが、画面1つになります（例: map.tsx → 地図画面）。

import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { TabBar } from '../components/TabBar';
import { tabs } from '../constants/tabs';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Tabs screenOptions={{ headerShown: false }} tabBar={props => <TabBar {...props} />}>
        {tabs.map(tab => (
          <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
        ))}
      </Tabs>
    </>
  );
}
