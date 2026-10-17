// セクションの見出しです。onPressMore を渡すと、右側に矢印ボタンが出ます。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../constants/theme';
import { ArrowForwardIcon } from './Icons';

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
          hitSlop={12}
          onPress={onPressMore}
          style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
        >
          <ArrowForwardIcon color={colors.textOnDark} />
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
    paddingLeft: 33,
    paddingRight: 19,
    minHeight: 22,
  },
  title: {
    ...fonts.heading,
    color: colors.text,
  },
  moreButton: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
