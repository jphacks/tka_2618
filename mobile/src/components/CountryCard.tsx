// 「国名から選ぶ」で横に並ぶ、国のカードです。
// 料理の写真の下側を暗くして、その上に国旗と国名を白い文字で載せています。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Country } from '../data/types';
import { CardImage } from './CardImage';
import { GradientOverlay } from './GradientOverlay';

type Props = {
  country: Country;
  onPress?: (country: Country) => void;
};

export const COUNTRY_CARD_WIDTH = 136;

export function CountryCard({ country, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={country.name}
      onPress={() => onPress?.(country)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <CardImage imageUrl={country.imageUrl} style={StyleSheet.absoluteFill} />
      <GradientOverlay
        stops={[
          { offset: 0.4, opacity: 0 },
          { offset: 1, opacity: 0.7 },
        ]}
      />
      <View style={styles.footer}>
        <Text style={styles.flag}>{country.flag}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {country.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: COUNTRY_CARD_WIDTH,
    height: 168,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.imagePlaceholder,
  },
  pressed: {
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  flag: {
    fontSize: 24,
    lineHeight: 32,
  },
  name: {
    ...fonts.cardTitle,
    color: colors.textOnImage,
  },
});
