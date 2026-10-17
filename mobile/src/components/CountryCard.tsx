// 「国名から選ぶ」で横に並ぶ、国のカードです。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../constants/theme';
import type { Country } from '../data/types';
import { CardImage } from './CardImage';

type Props = {
  country: Country;
  onPress?: (country: Country) => void;
};

export function CountryCard({ country, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={country.name}
      onPress={() => onPress?.(country)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <CardImage imageUrl={country.imageUrl} style={styles.image} />
      <View style={styles.footer}>
        <Text style={styles.name} numberOfLines={1}>
          {country.flag} {country.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    height: 109,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.cardFooter,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    flex: 1,
  },
  footer: {
    height: 27,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  name: {
    ...fonts.caption,
    color: colors.text,
  },
});
