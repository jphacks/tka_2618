// セクションの見出しです。onPressMore を渡すと、右側に「>」の丸ボタンが出ます。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { ChevronRightIcon } from './Icons';

type Props = {
  title: string;
  onPressMore?: () => void;
};

export function SectionHeader({ title, onPressMore }: Props) {
  return (
    <View style={styles.row}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {onPressMore && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${title}をすべて見る`}
          hitSlop={spacing.sm}
          onPress={onPressMore}
          style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
        >
          <ChevronRightIcon color={colors.text} size={16} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  title: {
    ...fonts.sectionTitle,
    color: colors.text,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
