import { StyleSheet, Text, View } from 'react-native';

export function DemoModeNotice() {
  return (
    <View accessibilityRole="alert" style={styles.notice}>
      <Text style={styles.title}>デモモード</Text>
      <Text style={styles.text}>現在地・カメラ・店舗検索を使用しません。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { backgroundColor: '#fff4d6', borderColor: '#e4be57', borderWidth: 1, borderRadius: 12, padding: 12, gap: 3 },
  title: { color: '#624800', fontSize: 14, fontWeight: '700' },
  text: { color: '#765b12', fontSize: 12 },
});
