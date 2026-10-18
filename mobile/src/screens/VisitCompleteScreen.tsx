import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { RegionStampPreview } from '../components/RegionStampPreview';
import { colors, radius, spacing } from '../constants/theme';
import { findCountry } from '../data/api';
import { japanMapShapes } from '../data/japanMapShapes';
import { worldMapShapes, type MapShape } from '../data/mapShapes';
import { getCachedCountries } from '../repositories/locationCatalogRepository';
import { getVisitById } from '../repositories/visitRepository';

type CompleteState =
  | { status: 'loading' }
  | { status: 'ready'; regionName: string; shape: MapShape; shopName: string }
  | { status: 'missing' };

export function VisitCompleteScreen() {
  const params = useLocalSearchParams<{ visitId?: string | string[] }>();
  const visitId = typeof params.visitId === 'string' ? params.visitId : '';
  const [state, setState] = useState<CompleteState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    if (!visitId) {
      setState({ status: 'missing' });
      return () => { active = false; };
    }

    void Promise.all([
      getVisitById(visitId),
      getCachedCountries().catch(() => null),
    ]).then(([visit, countries]) => {
      if (!active) return;
      if (!visit) {
        setState({ status: 'missing' });
        return;
      }

      const prefecture = visit.countryCode === 'JP' && visit.prefectureCode
        ? japanMapShapes.find(shape => shape.code === visit.prefectureCode)
        : undefined;
      const country = worldMapShapes.find(shape => shape.code === visit.countryCode);
      const shape = prefecture ?? country;
      if (!shape) {
        setState({ status: 'missing' });
        return;
      }

      const regionName = prefecture?.name
        ?? countries?.find(item => item.code === visit.countryCode)?.name_ja
        ?? findCountry(visit.countryCode)?.name
        ?? shape.name;
      setState({ status: 'ready', regionName, shape, shopName: visit.shopName });
    }).catch(() => {
      if (active) setState({ status: 'missing' });
    });

    return () => { active = false; };
  }, [visitId]);

  if (state.status === 'loading') {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator accessibilityLabel="獲得した地域を読み込み中" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (state.status === 'missing') {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text accessibilityRole="alert" style={styles.error}>獲得した地域を表示できませんでした。</Text>
        <Button title="予約一覧に戻る" onPress={() => router.replace('/reservations')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.celebration}>
          <Text style={styles.eyebrow}>NEW STAMP</Text>
          <View accessible={false} style={styles.mark}><Text style={styles.markText}>✦</Text></View>
          <Text accessibilityRole="header" style={styles.title}>{state.regionName}を獲得しました！</Text>
          <Text style={styles.description}>{state.shopName}の訪問を記録しました</Text>
        </View>

        <RegionStampPreview shape={state.shape} label={state.regionName} />

        <View style={styles.actions}>
          <Button title="地図を見る" onPress={() => router.replace('/map')} />
          <Button title="予約一覧に戻る" variant="secondary" onPress={() => router.replace('/reservations')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.screen },
  content: { flexGrow: 1, width: '100%', maxWidth: 560, alignSelf: 'center', justifyContent: 'center', padding: spacing.screen, paddingBottom: 40, gap: spacing.xl },
  celebration: { alignItems: 'center', gap: spacing.sm },
  eyebrow: { color: '#8a6714', fontSize: 12, fontWeight: '800', letterSpacing: 2.4 },
  mark: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: '#111111' },
  markText: { color: '#f4cf68', fontSize: 32, lineHeight: 40 },
  title: { color: colors.text, fontSize: 28, lineHeight: 38, fontWeight: '800', textAlign: 'center' },
  description: { color: '#52605c', fontSize: 15, lineHeight: 23, textAlign: 'center' },
  actions: { gap: spacing.sm },
  error: { color: '#b33030', lineHeight: 22, textAlign: 'center' },
});
