import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { captureVisitPhoto } from '../services/visitPhotos';

export function CameraScreen() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const { reservations, setPendingVisitPhoto } = useAppData();
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();
  const reservation = reservations.find(item => item.id === reservationId);

  const takePhoto = async () => {
    if (!reservation || isCapturing) return;
    setIsCapturing(true);
    setMessage('');

    const result = await captureVisitPhoto();
    if (result.status === 'captured') {
      try {
        await setPendingVisitPhoto({ reservationId: reservation.id, uri: result.uri });
        router.replace({
          pathname: '/reservations/confirm',
          params: { reservationId: reservation.id },
        });
      } catch {
        setIsCapturing(false);
        setMessage('撮影した写真を一時保存できませんでした。もう一度お試しください。');
      }
      return;
    }

    setIsCapturing(false);
    setMessage(result.status === 'cancelled' ? '撮影をキャンセルしました。' : result.message);
  };

  return (
    <View style={styles.screen}>
      <Header title="写真を撮影" showBack />
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        {!reservation ? (
          <Text style={styles.notFound}>予約が見つかりませんでした</Text>
        ) : (
          <>
            <View style={styles.guide}>
              <Text style={styles.guideTitle}>料理やお店の様子を撮影してください</Text>
              <Text style={styles.guideText}>撮影した写真は、記録する前に確認できます</Text>
            </View>
            <View style={styles.actions}>
              <Button
                title={isCapturing ? '起動しています…' : 'カメラを起動'}
                onPress={takePhoto}
                disabled={isCapturing}
              />
              {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.screen,
    gap: spacing.lg,
  },
  guide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  guideTitle: {
    ...fonts.sectionTitle,
    color: colors.text,
    textAlign: 'center',
  },
  guideText: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
  message: {
    ...fonts.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notFound: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
