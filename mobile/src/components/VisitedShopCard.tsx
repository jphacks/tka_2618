// 「今まで訪れたお店」のカードです（Figma の「訪れたお店カード」）。
// 写真の左上に国バッジ、写真の下にお店の名前と訪れた日を表示します。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Country, VisitedShop } from '../data/types';
import { formatDate } from '../utils/date';
import { CardImage } from './CardImage';
import { CountryBadge } from './CountryBadge';

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
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
    >
      <View>
        <CardImage imageUrl={shop.imageUrl} style={styles.image} />
        {country && (
          <View style={styles.badge}>
            <CountryBadge country={country} />
          </View>
        )}
      </View>
      <Text style={styles.shopName} numberOfLines={1}>
        {shop.name}
      </Text>
      <Text style={styles.visitedAt}>{formatDate(shop.visitedAt)}に訪問</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  image: {
    // Figma のカード（164 × 112）と同じ縦横比
    aspectRatio: 164 / 112,
    borderRadius: radius.lg,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
  },
  shopName: {
    ...fonts.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  visitedAt: {
    ...fonts.caption,
    color: colors.textSecondary,
  },
});
