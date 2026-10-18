import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { CardImage } from '../components/CardImage';
import { FormField, TextField } from '../components/FormField';
import { Header } from '../components/Header';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import type { VisitRecord } from '../data/visitTypes';
import { saveVisit } from '../repositories/visitRepository';
import { captureVisitPhoto } from '../services/visitPhotos';
import { todayString } from '../utils/date';

export function PhotoConfirmScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const { isReady, reservations, addVisitedShop, pendingVisitPhoto, setPendingVisitPhoto, clearPendingVisitPhoto } = useAppData();
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [saveError, setSaveError] = useState('');

  const reservation = reservations.find(item => item.id === reservationId);
  const photoUri = pendingVisitPhoto?.reservationId === reservationId ? pendingVisitPhoto.uri : undefined;

  const retake = async () => {
    if (!reservation || isSaving || isCapturing) return;
    setIsCapturing(true);
    setSaveError('');

    const result = await captureVisitPhoto();
    if (result.status === 'captured') {
      try {
        await setPendingVisitPhoto({ reservationId: reservation.id, uri: result.uri });
      } catch {
        setSaveError('撮影した写真を一時保存できませんでした。もう一度お試しください。');
      }
    } else {
      setSaveError(result.status === 'cancelled' ? '撮影をキャンセルしました。' : result.message);
    }
    setIsCapturing(false);
  };

  const record = async () => {
    if (!reservation || !photoUri || isSaving || isCapturing) return;
    setIsSaving(true);
    setSaveError('');
    const visitedAt = new Date();
    const visit: VisitRecord = {
      id: `visit-${Date.now()}`,
      reservationId: reservation.id,
      shopId: reservation.shopId ?? reservation.id,
      shopName: reservation.shopName,
      countryCode: reservation.countryCode,
      prefectureCode: reservation.countryCode === 'JP' ? reservation.prefectureCode ?? null : null,
      address: reservation.info ?? null,
      photoUris: [photoUri],
      memo: memo.trim(),
      visitedAt: visitedAt.toISOString(),
      verification: {
        mode: 'photo',
        status: 'verified',
        distanceMeters: null,
        accuracyMeters: null,
      },
    };

    try {
      await saveVisit(visit);
      await addVisitedShop({
        name: reservation.shopName,
        countryCode: reservation.countryCode,
        visitedAt: todayString(visitedAt),
        imageUrl: photoUri,
        memo: memo.trim() || undefined,
      });
      await clearPendingVisitPhoto();
      router.replace('/map');
    } catch {
      setIsSaving(false);
      setSaveError('訪問記録を保存できませんでした。');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="画像を確認" showBack />
      {!isReady ? (
        <View style={styles.loading}>
          <ActivityIndicator accessibilityLabel="撮影した写真を読み込み中" color={colors.primary} />
          <Text style={styles.notFound}>写真を読み込んでいます…</Text>
        </View>
      ) : !reservation ? (
        <Text style={styles.notFound}>予約が見つかりませんでした</Text>
      ) : !photoUri ? (
        <View style={styles.missingPhoto}>
          <Button
            title={isCapturing ? '起動しています…' : '写真を撮り直す'}
            variant="secondary"
            onPress={() => void retake()}
            disabled={isCapturing}
          />
          <Button title="予約一覧に戻る" variant="secondary" onPress={() => router.replace('/reservations')} disabled={isCapturing} />
          {saveError ? <Text accessibilityRole="alert" style={styles.saveError}>{saveError}</Text> : null}
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <FormField label="画像">
              <CardImage imageUrl={photoUri} style={styles.photo} />
            </FormField>
            <FormField label="メモ">
              <TextField
                accessibilityLabel="メモ"
                placeholder="感想やメモを入力"
                value={memo}
                onChangeText={setMemo}
                multiline
                height={120}
              />
            </FormField>
          </ScrollView>
          <View style={styles.footer}>
            {saveError ? <Text accessibilityRole="alert" style={styles.saveError}>{saveError}</Text> : null}
            <Button
              title={isCapturing ? '起動しています…' : '写真を撮り直す'}
              variant="secondary"
              onPress={() => void retake()}
              disabled={isSaving || isCapturing}
            />
            <Button title={isSaving ? '保存しています…' : '記録する'} onPress={() => void record()} disabled={isSaving || isCapturing} />
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  notFound: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  missingPhoto: {
    padding: spacing.screen,
    gap: spacing.lg,
  },
  loading: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.screen,
  },
  content: {
    padding: spacing.screen,
    gap: spacing.lg,
  },
  photo: {
    height: 264,
    borderRadius: radius.lg,
  },
  footer: {
    padding: spacing.screen,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  saveError: {
    ...fonts.caption,
    color: '#b33030',
    textAlign: 'center',
  },
});
