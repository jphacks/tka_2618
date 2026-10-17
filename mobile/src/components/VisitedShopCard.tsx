// 「今まで訪れたお店」に並ぶ、お店のカードです。
// 写真の左上に国旗と国名、写真の下にお店の名前と訪れた日を表示します。

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Country, VisitedShop } from '../data/types';
import { CardImage } from './CardImage';

type Props = {
  shop: VisitedShop;
  country?: Country;
  width: number;
  onPress?: (shop: VisitedShop) => void;
};

// '2026-10-01' → '2026年10月1日'
function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return `${year}年${month}月${day}日`;
}

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
          // 写真の上でも読めるよう、白い下地のラベルにしています
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {country.flag} {country.name}
            </Text>
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
    aspectRatio: 1,
    borderRadius: radius.md,
  },
  chip: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    maxWidth: '85%',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.chipBackground,
  },
  chipText: {
    ...fonts.label,
    lineHeight: 24,
    color: colors.text,
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
