// 国のカードです（Figma の「国カード」）。上に料理の写真、下に国旗と国名。
// ホームの横スクロールと「国名から選ぶ」画面の2列で使います。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Country } from '../data/types';
import { CardImage } from './CardImage';

type Props = {
  country: Country;
  width: number;
  onPress?: (country: Country) => void;
};

export function CountryCard({ country, width, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${country.name}の料理のお店を探す`}
      onPress={() => onPress?.(country)}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <CardImage imageUrl={country.imageUrl} style={styles.image} />
      <View style={styles.label}>
        <Text style={styles.name} numberOfLines={1}>
          {country.flag} {country.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'flex-start',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    height: 104,
  },
  label: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  name: {
    ...fonts.bodyBold,
    color: colors.text,
  },
});
