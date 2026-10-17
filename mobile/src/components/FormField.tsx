// 入力欄のまとまり（上に項目名、下に入力欄）と、入力欄の部品です。
//   TextField   … 文字を入力する欄（お店の名前、メモ など）
//   SelectField … 押すと選択肢が出る欄（国、予約日時 など）

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { ChevronDownIcon } from './Icons';

export function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  // 複数行（メモなど）の高さ
  height?: number;
};

export function TextField({ height, multiline, ...props }: TextFieldProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      multiline={multiline}
      textAlignVertical={multiline ? 'top' : 'center'}
      style={[styles.box, styles.input, height ? { height } : null]}
      {...props}
    />
  );
}

type SelectFieldProps = {
  value?: string; // 選ばれている値の表示（なければ placeholder を薄く出す）
  placeholder: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export function SelectField({ value, placeholder, onPress, accessibilityLabel }: SelectFieldProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.box, styles.select, pressed && styles.pressed]}
    >
      <Text style={[styles.inputText, !value && styles.placeholder]} numberOfLines={1}>
        {value ?? placeholder}
      </Text>
      <ChevronDownIcon color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    ...fonts.bodyBold,
    color: colors.text,
  },
  box: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    ...fonts.body,
    color: colors.text,
    paddingVertical: 12,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  inputText: {
    ...fonts.body,
    flex: 1,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
