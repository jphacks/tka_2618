// まだ作っていない画面の仮表示です。中身ができたら、この部品は使わなくなります。

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../constants/theme';

type Props = {
  title: string;
  children?: ReactNode;
};

export function PlaceholderScreen({ title, children }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.note}>この画面は準備中です</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.screen,
    gap: spacing.md,
  },
  title: {
    ...fonts.heading,
    color: colors.text,
  },
  note: {
    ...fonts.body,
    color: colors.tabInactive,
  },
});
