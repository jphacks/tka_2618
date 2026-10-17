// 「今まで訪れたお店」に並ぶ、お店のカードです。左上に国旗と国名を表示します。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../constants/theme';
import type { Country, VisitedShop } from '../data/types';
import { CardImage } from './CardImage';

type Props = {
  shop: VisitedShop;
  country?: Country;
  width: number;
  onPress?: (shop: VisitedShop) => void;
};

export function VisitedShopCard({ shop, country, width, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${country?.name ?? ''} ${shop.name}`}
      onPress={() => onPress?.(shop)}
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
    >
      <CardImage imageUrl={shop.imageUrl} style={styles.image} />
      {country && (
        <Text style={styles.country} numberOfLines={1}>
          {country.flag}
          {country.name}
        </Text>
      )}
      <View style={styles.footer}>
        <Text style={styles.shopName} numberOfLines={1}>
          {shop.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // Figma のカード（164 × 135）と同じ縦横比にします
    aspectRatio: 164 / 135,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.cardFooter,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    flex: 1,
  },
  country: {
    ...fonts.heading,
    color: colors.text,
    position: 'absolute',
    top: 13,
    left: 17,
    right: 17,
  },
  footer: {
    height: 33,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  shopName: {
    ...fonts.caption,
    color: colors.text,
  },
});
