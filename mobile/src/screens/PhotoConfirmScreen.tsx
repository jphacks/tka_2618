// 撮影した画像を確認する画面です（Figma の「画像を確認」）。
// メモを書いて「記録する」を押すと「今まで訪れたお店」に追加され、地図タブに移動します。

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { CardImage } from '../components/CardImage';
import { FormField, TextField } from '../components/FormField';
import { Header } from '../components/Header';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { findCountry } from '../data/api';
import { todayString } from '../utils/date';

export function PhotoConfirmScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const { reservations, addVisitedShop } = useAppData();
  const [memo, setMemo] = useState('');

  const reservation = reservations.find(item => item.id === reservationId);
  // 仮実装：撮った写真の代わりに、予約したお店（なければその国）の料理写真を使います
  const photoUrl = reservation?.imageUrl ?? findCountry(reservation?.countryCode)?.imageUrl;

  const record = () => {
    if (!reservation) return;
    addVisitedShop({
      name: reservation.shopName,
      countryCode: reservation.countryCode,
      visitedAt: todayString(),
      imageUrl: photoUrl,
      memo: memo.trim() || undefined,
    });
    // この画面を閉じてから、地図タブに移動します
    router.back();
    router.navigate('/map');
  };

  return (
    <View style={styles.screen}>
      <Header title="画像を確認" showBack />
      {!reservation ? (
        <Text style={styles.notFound}>予約が見つかりませんでした</Text>
      ) : (
        <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <FormField label="画像">
              <View>
                <CardImage imageUrl={photoUrl} style={styles.photo} />
                <Text style={styles.photoNote}>仮の写真（カメラは未実装）</Text>
              </View>
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
  content: {
    padding: spacing.screen,
    gap: spacing.lg,
  },
  photo: {
    height: 264,
    borderRadius: radius.lg,
  },
  photoNote: {
    ...fonts.caption,
    color: colors.textOnImage,
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.scrim,
    overflow: 'hidden',
  },
  footer: {
    padding: spacing.screen,
    paddingTop: spacing.sm,
  },
});
