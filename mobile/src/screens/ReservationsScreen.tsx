// 予約したお店の一覧です（Figma の「予約したお店」）。
// 「＋ 予約を記録」で予約を作成、カードの「予約を削除」で確認ダイアログを出します。

import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Header } from '../components/Header';
import { ReservationCard } from '../components/ReservationCard';
import { colors, fonts, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { findCountry } from '../data/api';
import type { Reservation } from '../data/types';

export function ReservationsScreen() {
  const { reservations, removeReservation } = useAppData();
  // 削除しようとしている予約（確認ダイアログを出している間だけ入る）
  const [deleting, setDeleting] = useState<Reservation | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteError('');
    try {
      await removeReservation(deleting.id);
      setDeleting(null);
    } catch {
      setDeleting(null);
      setDeleteError('予約を削除できませんでした。もう一度お試しください。');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="予約したお店" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.toolbar}>
          <Button title="＋ 予約を記録" size="small" onPress={() => router.push('/reservations/new')} />
        </View>

        {reservations.length === 0 && (
          <Text style={styles.empty}>
            予約したお店はまだありません。{'\n'}「＋ 予約を記録」から追加できます。
          </Text>
        )}

        {deleteError ? <Text accessibilityRole="alert" style={styles.error}>{deleteError}</Text> : null}

        {reservations.map(reservation => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            country={findCountry(reservation.countryCode)}
            onPressPhoto={item => router.push(`/camera?reservationId=${item.id}`)}
            onPressDelete={setDeleting}
          />
        ))}
      </ScrollView>

      <ConfirmDialog
        visible={deleting !== null}
        title="この予約を削除しますか？"
        message="削除すると元に戻せません"
        confirmLabel="削除する"
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  empty: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  error: {
    ...fonts.caption,
    color: '#b33030',
    textAlign: 'center',
  },
});
