// 写真を撮影する画面です（Figma の「写真を撮影」）。タブバーなしの全画面で表示します。
//
// ※ カメラは見た目だけの仮実装です。シャッターを押すと、予約したお店の料理写真を
//    「撮った写真」の代わりにして「画像を確認」へ進みます。
//    本物のカメラにするときは expo-camera を入れて、灰色の枠を CameraView に置き換えます。

import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Header } from '../components/Header';
import { colors, fonts, radius, spacing } from '../constants/theme';

export function CameraScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const insets = useSafeAreaInsets();

  const takePhoto = () => {
    // カメラ画面を閉じてから、予約タブの「画像を確認」を開きます
    router.back();
    router.navigate(`/reservations/confirm?reservationId=${reservationId ?? ''}`);
  };

  return (
    <View style={styles.screen}>
      <Header title="写真を撮影" showBack />
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.preview}>
          <Text style={styles.previewText}>カメラの映像（仮）</Text>
        </View>
        <Text style={styles.hint}>料理が枠に収まるように撮影してください</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="シャッター"
          onPress={takePhoto}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ShutterIcon />
        </Pressable>
      </View>
    </View>
  );
}

// シャッターボタン（Figma の SVG と同じ形: 76 × 76）
function ShutterIcon() {
  return (
    <Svg width={76} height={76} viewBox="0 0 76 76" fill="none">
      <Circle cx={38} cy={38} r={36} stroke={colors.primary} strokeWidth={4} />
      <Circle cx={38} cy={38} r={29} fill={colors.primary} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.screen,
  },
  preview: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.cameraPreview,
  },
  previewText: {
    ...fonts.body,
    color: colors.textOnImage,
  },
  hint: {
    ...fonts.caption,
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
