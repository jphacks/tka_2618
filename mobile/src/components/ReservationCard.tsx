// 予約したお店のカードです（Figma の「予約カード」）。
// 下に「写真を撮る」「予約を削除」の2つのボタンがあります。

import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { Country, Reservation } from '../data/types';
import { formatDateTime } from '../utils/date';
import { Button } from './Button';
import { CardImage } from './CardImage';
import { CountryBadge } from './CountryBadge';

type Props = {
  reservation: Reservation;
  country?: Country;
  onPressPhoto: (reservation: Reservation) => void;
  onPressDelete: (reservation: Reservation) => void;
};

export function ReservationCard({ reservation, country, onPressPhoto, onPressDelete }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <CardImage imageUrl={reservation.imageUrl} style={styles.image} />
        <View style={styles.info}>
          {country && <CountryBadge country={country} />}
          <Text style={styles.shopName} numberOfLines={1}>
            {reservation.shopName}
          </Text>
          <Text style={styles.detail}>{formatDateTime(reservation.dateTime)}</Text>
          {reservation.info && (
            <Text style={styles.detail} numberOfLines={1}>
              {reservation.info}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="写真を撮る" size="small" onPress={() => onPressPhoto(reservation)} style={styles.action} />
        <Button
          title="予約を削除"
          size="small"
          variant="secondary"
          onPress={() => onPressDelete(reservation)}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  content: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 88,
    height: 72,
    borderRadius: radius.md,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  shopName: {
    ...fonts.cardTitle,
    color: colors.text,
  },
  detail: {
    ...fonts.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
