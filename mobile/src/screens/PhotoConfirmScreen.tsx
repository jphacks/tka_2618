import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { CardImage } from '../components/CardImage';
import { FormField, TextField } from '../components/FormField';
import { Header } from '../components/Header';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { todayString } from '../utils/date';

export function PhotoConfirmScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const { reservations, addVisitedShop, pendingVisitPhoto, clearPendingVisitPhoto } = useAppData();
  const [memo, setMemo] = useState('');

  const reservation = reservations.find(item => item.id === reservationId);
  const photoUri = pendingVisitPhoto?.reservationId === reservationId ? pendingVisitPhoto.uri : undefined;

  const retake = () => {
    if (!reservation) return;
    clearPendingVisitPhoto();
    router.replace({ pathname: '/camera', params: { reservationId: reservation.id } });
  };

  const record = () => {
    if (!reservation || !photoUri) return;
    addVisitedShop({
      name: reservation.shopName,
      countryCode: reservation.countryCode,
      visitedAt: todayString(),
      imageUrl: photoUri,
      memo: memo.trim() || undefined,
    });
    clearPendingVisitPhoto();
    router.replace('/map');
  };

  return (
    <View style={styles.screen}>
      <Header title="画像を確認" showBack />
      {!reservation ? (
        <Text style={styles.notFound}>予約が見つかりませんでした</Text>
      ) : !photoUri ? (
        <View style={styles.missingPhoto}>
          <Text style={styles.notFound}>撮影した写真が見つかりませんでした</Text>
          <Button title="写真を撮り直す" variant="secondary" onPress={retake} />
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
            <Button title="写真を撮り直す" variant="secondary" onPress={retake} />
            <Button title="記録する" onPress={record} />
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
});
