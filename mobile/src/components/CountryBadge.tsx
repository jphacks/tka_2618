// 国旗と国名の白いラベルです。写真の上や予約カードの中で使います。

import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Country } from '../data/types';

type Props = {
  country: Country;
};

export function CountryBadge({ country }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text} numberOfLines={1}>
        {country.flag} {country.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.badgeBackground,
  },
  text: {
    ...fonts.badge,
    color: colors.text,
  },
});
