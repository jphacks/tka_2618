// アプリ全体のいちばん外側の「枠」です。
// (tabs) … 下にタブバーがある画面のまとまり
// camera  … タブバーなしで全画面に出す「写真を撮影」画面
//
// AppDataProvider で、予約や記録をすべての画面で共有しています。

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppDataProvider } from '../data/AppDataContext';

export default function RootLayout() {
  return (
    // スタンプ地図のピンチ・ドラッグ操作に必要な、ジェスチャー判定の土台です。
    <GestureHandlerRootView style={styles.root}>
      <AppDataProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AppDataProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
