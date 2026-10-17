// 設定画面の1行です（Figma の「設定の項目」）。
// 右側は、何も指定しなければ「>」、right を渡すとトグルなどに変えられます。

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/theme';
import { ChevronRightIcon } from './Icons';

type Props = {
  label: string;
  onPress?: () => void;
  right?: ReactNode;
};

export function SettingsItem({ label, onPress, right }: Props) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      {right ?? <ChevronRightIcon color={colors.textSecondary} />}
    </>
  );

  // トグルなど、行の中に自分で押せる部品がある場合は、行全体は押せないようにします
  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    ...fonts.item,
    color: colors.text,
  },
});
