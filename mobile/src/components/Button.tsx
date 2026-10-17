// ボタンです。Figma の「ボタン」コンポーネントと同じく、
// 種類（プライマリ=黒 / セカンダリ=白）と サイズ（大 / 小）を選べます。

import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'large' | 'small';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', size = 'large', disabled = false, style }: Props) {
  const primary = variant === 'primary';
  const large = size === 'large';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        large ? styles.large : styles.small,
        primary ? styles.primary : styles.secondary,
        (pressed || disabled) && styles.dimmed,
        style,
      ]}
    >
      <Text style={[large ? fonts.buttonLarge : fonts.buttonSmall, { color: primary ? colors.onPrimary : colors.primary }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  large: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  small: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  dimmed: {
    opacity: 0.6,
  },
});
