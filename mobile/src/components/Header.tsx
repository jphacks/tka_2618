// 画面上部のヘッダー（戻るボタン + タイトル）です。
// showBack を付けると、左に「←」が出て、押すと前の画面に戻ります。

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../constants/theme';
import { BackIcon } from './Icons';

type Props = {
  title: string;
  showBack?: boolean;
  // 戻るボタンを押したときの動き（指定しなければ前の画面に戻ります）
  onBack?: () => void;
};

export function Header({ title, showBack = false, onBack }: Props) {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {showBack && (
            <Pressable accessibilityRole="button" accessibilityLabel="戻る" hitSlop={spacing.sm} onPress={goBack}>
              <BackIcon color={colors.text} />
            </Pressable>
          )}
        </View>
        <Text accessibilityRole="header" style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
  },
  bar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  side: {
    width: 40,
  },
  title: {
    ...fonts.headerTitle,
    flex: 1,
    color: colors.text,
    textAlign: 'center',
  },
});
