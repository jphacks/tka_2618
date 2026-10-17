// 虫めがねアイコン付きの検索欄です（Figma の「国名で検索」）。

import { StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { SearchIcon } from './Icons';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

export function SearchField({ value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.box}>
      <SearchIcon color={colors.text} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    ...fonts.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
});
