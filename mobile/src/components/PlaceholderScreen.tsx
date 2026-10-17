// まだ作っていない画面の仮表示です。中身ができたら、この部品は使わなくなります。

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../constants/theme';
import { Header } from './Header';

type Props = {
  title: string;
  children?: ReactNode;
};

export function PlaceholderScreen({ title, children }: Props) {
  return (
    <View style={styles.screen}>
      <Header title={title} />
      <View style={styles.content}>
        <Text style={styles.note}>この画面は準備中です</Text>
        {children}
      </View>
    </View>
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
  note: {
    ...fonts.body,
    color: colors.textSecondary,
  },
});
