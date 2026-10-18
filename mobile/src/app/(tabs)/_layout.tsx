// 下にタブバーを置き、タブで画面を切り替える「枠」です。
// タブの一覧は src/constants/tabs.ts で決めています。

import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';
import { tabs } from '../../constants/tabs';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={props => <TabBar {...props} />}>
      {tabs.map(tab => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
