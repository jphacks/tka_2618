import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StampMap } from '../components/StampMap';
import { colors, radius, spacing } from '../constants/theme';
import { japanMapShapes } from '../data/japanMapShapes';
import { japanMapViewBox, worldMapShapes, worldMapViewBox, type MapShape } from '../data/mapShapes';
import { searchApi, type Prefecture, type SearchCountry } from '../data/searchApi';
import type { VisitRecord } from '../data/visitTypes';
import { clearDemoVisits, listVisits } from '../repositories/visitRepository';

type MapMode = 'world' | 'japan';

export function StampMapScreen() {
  const [mode, setMode] = useState<MapMode>('world');
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [names, setNames] = useState<ReadonlyMap<string, string>>(new Map());
  const [selected, setSelected] = useState<MapShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(useCallback(() => {
    void attempt;
    let active = true;
    const controller = new AbortController();
    setLoading(true); setError('');

    async function load() {
      try {
        const storedVisits = await listVisits();
        if (!active) return;
        setVisits(storedVisits);
        setLoading(false);
        try {
          const [countries, prefectures] = await Promise.all([
            searchApi<{ countries: SearchCountry[] }>('/api/countries', controller.signal),
            searchApi<{ regions: Prefecture[] }>('/api/countries/JP/regions', controller.signal),
          ]);
          if (active) setNames(new Map([
            ...countries.countries.map(country => [country.code, country.name_ja] as const),
            ...prefectures.regions.map(prefecture => [prefecture.code, prefecture.name_ja] as const),
          ]));
        } catch {
          // 地図と訪問記録はオフラインでも表示し、地域名だけSVGの名称へフォールバックする。
        }
      } catch {
        if (active) { setError('訪問記録を読み込めませんでした。'); setLoading(false); }
      }
    }
    void load();
    return () => { active = false; controller.abort(); };
  }, [attempt]));

  const verifiedVisits = useMemo(() => visits.filter(visit => visit.verification.status === 'verified'), [visits]);
  const worldCounts = useMemo(() => {
    const counts = new Map<string, number>();
    verifiedVisits.forEach(visit => counts.set(visit.countryCode, (counts.get(visit.countryCode) ?? 0) + 1));
    return counts;
  }, [verifiedVisits]);
  const japanCounts = useMemo(() => {
    const counts = new Map<string, number>();
    verifiedVisits.forEach(visit => {
      if (visit.countryCode === 'JP' && visit.prefectureCode) {
        counts.set(visit.prefectureCode, (counts.get(visit.prefectureCode) ?? 0) + 1);
      }
    });
    return counts;
  }, [verifiedVisits]);

  const shapes = mode === 'world' ? worldMapShapes : japanMapShapes;
  const viewBox = mode === 'world' ? worldMapViewBox : japanMapViewBox;
  const counts = mode === 'world' ? worldCounts : japanCounts;
  const visitedRegions = shapes.filter(shape => (counts.get(shape.code) ?? 0) > 0);

  const selectMode = (nextMode: MapMode) => {
    setMode(nextMode);
    setSelected(null);
  };

  const resetDemo = () => {
    Alert.alert('デモ記録をリセット', 'デモで作成した訪問記録を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除する', style: 'destructive', onPress: () => {
        void clearDemoVisits().then(() => setAttempt(value => value + 1)).catch(() => setError('デモ記録を削除できませんでした。'));
      } },
    ]);
  };

  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View><Text style={styles.eyebrow}>STAMP JOURNEY</Text><Text accessibilityRole="header" style={styles.title}>旅のスタンプ地図</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/map')}><Text style={styles.searchLink}>お店を探す</Text></Pressable>
        </View>

        <View accessibilityRole="tablist" style={styles.segmented}>
          {(['world', 'japan'] as const).map(item => (
            <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: mode === item }} onPress={() => selectMode(item)} style={[styles.segment, mode === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, mode === item && styles.segmentTextActive]}>{item === 'world' ? '世界' : '日本'}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? <ActivityIndicator accessibilityLabel="訪問記録を読み込み中" color={colors.tabActive} /> : error ? (
          <View style={styles.notice}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Pressable accessibilityRole="button" onPress={() => setAttempt(value => value + 1)} style={styles.retry}><Text>再読み込み</Text></Pressable></View>
        ) : (
          <>
            <StampMap shapes={shapes} viewBox={viewBox} visitCounts={counts} selectedCode={selected?.code ?? null} onSelect={setSelected} />
            <Text style={styles.progress}>{visitedRegions.length}地域を訪問済み</Text>
            {selected && (
              <View style={styles.selectedCard}>
                <Text style={styles.selectedName}>{names.get(selected.code) ?? selected.name}</Text>
                <Text style={styles.selectedCount}>{counts.get(selected.code) ?? 0}回の訪問</Text>
              </View>
            )}
            {visitedRegions.length === 0 ? <Text style={styles.empty}>まだ訪問記録がありません。</Text> : (
              <View style={styles.list}>
                <Text accessibilityRole="header" style={styles.heading}>訪問した地域</Text>
                {visitedRegions.sort((left, right) => (names.get(left.code) ?? left.name).localeCompare(names.get(right.code) ?? right.name, 'ja')).map(shape => (
                  <Pressable key={shape.code} accessibilityRole="button" onPress={() => setSelected(shape)} style={styles.regionRow}>
                    <Text style={styles.regionName}>{names.get(shape.code) ?? shape.name}</Text>
                    <Text style={styles.regionCount}>{counts.get(shape.code)}回 ›</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </>
        )}

        {__DEV__ && <Pressable accessibilityRole="button" onPress={resetDemo} style={styles.resetButton}><Text style={styles.resetText}>デモ記録をリセット</Text></Pressable>}
        <Text style={styles.credit}>日本地図素材: lalamalink（CC0 1.0）／世界地図素材: @svg-maps/world（CC BY 4.0）</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: spacing.screen, paddingBottom: 48, gap: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md },
  eyebrow: { color: '#66736f', fontSize: 12, letterSpacing: 2, marginBottom: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  searchLink: { color: '#17613d', fontWeight: '700', paddingVertical: 8 },
  segmented: { flexDirection: 'row', borderRadius: radius.sm, backgroundColor: '#edf0ee', padding: 4 },
  segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  segmentActive: { backgroundColor: '#111' },
  segmentText: { color: '#52605c', fontWeight: '700' },
  segmentTextActive: { color: '#fff' },
  progress: { color: '#52605c', textAlign: 'center', fontWeight: '600' },
  selectedCard: { backgroundColor: '#e8f4ed', borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', gap: 4 },
  selectedName: { color: '#153d2b', fontSize: 18, fontWeight: '700' },
  selectedCount: { color: '#37644f' },
  empty: { color: '#66736f', textAlign: 'center', paddingVertical: spacing.lg },
  list: { gap: spacing.sm },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  regionRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccd3d0' },
  regionName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  regionCount: { color: '#52605c' },
  notice: { alignItems: 'center', gap: spacing.md },
  error: { color: '#b33030', textAlign: 'center' },
  retry: { minHeight: 48, borderWidth: 1, borderColor: '#adb7b3', borderRadius: radius.sm, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  resetButton: { minHeight: 48, borderRadius: radius.sm, borderWidth: 1, borderColor: '#c9a4a4', alignItems: 'center', justifyContent: 'center' },
  resetText: { color: '#983535', fontWeight: '700' },
  credit: { color: '#7b8582', fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
