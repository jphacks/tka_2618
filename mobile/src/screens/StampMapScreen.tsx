import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StampMap } from '../components/StampMap';
import { colors, radius, spacing } from '../constants/theme';
import { japanMapShapes } from '../data/japanMapShapes';
import { japanMapViewBox, worldMapShapes, worldMapViewBox, type MapShape } from '../data/mapShapes';
import { searchApi, type Prefecture, type SearchCountry } from '../data/searchApi';
import type { VisitRecord } from '../data/visitTypes';
import { listVisits } from '../repositories/visitRepository';

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
          if (active) {
            setNames(new Map([
              ...countries.countries.map(country => [country.code, country.name_ja] as const),
              ...prefectures.regions.map(prefecture => [prefecture.code, prefecture.name_ja] as const),
            ]));
          }
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
  const selectedVisits = selected ? verifiedVisits.filter(visit => mode === 'world'
    ? visit.countryCode === selected.code
    : visit.countryCode === 'JP' && visit.prefectureCode === selected.code) : [];
  const selectedName = selected ? names.get(selected.code) ?? selected.name : '';

  const selectMode = (nextMode: MapMode) => {
    setMode(nextMode);
    setSelected(null);
  };

  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <View><Text style={styles.eyebrow}>STAMP JOURNEY</Text><Text accessibilityRole="header" style={styles.title}>旅のスタンプ地図</Text></View>
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
            <View style={styles.legend}>
              <View style={styles.legendItem}><View style={[styles.legendSwatch, styles.visitedSwatch]} /><Text style={styles.legendText}>訪問済み</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendSwatch, styles.unvisitedSwatch]} /><Text style={styles.legendText}>まだ未訪問</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendSwatch, styles.selectedSwatch]} /><Text style={styles.legendText}>選択中</Text></View>
            </View>
            <Text style={styles.progress}>{visitedRegions.length}地域を訪問済み</Text>
            {selected && (
              <View style={styles.selectedCard}>
                <Text style={styles.selectedName}>{selectedName}</Text>
                <Text style={styles.selectedCount}>{selectedVisits.length}回の訪問</Text>
                {selectedVisits.slice(0, 3).map(visit => (
                  <Pressable
                    key={visit.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${visit.shopName}の訪問記録を見る`}
                    onPress={() => router.push({ pathname: '/visits/[id]', params: { id: visit.id } })}
                    style={({ pressed }) => [styles.visitRow, pressed && styles.pressed]}
                  >
                    <View style={styles.visitText}><Text style={styles.visitName}>{visit.shopName}</Text><Text style={styles.visitDate}>{new Date(visit.visitedAt).toLocaleDateString('ja-JP')}</Text></View>
                    <Text style={styles.visitArrow}>›</Text>
                  </Pressable>
                ))}
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
  segmented: { flexDirection: 'row', borderRadius: radius.sm, backgroundColor: '#edf0ee', padding: 4 },
  segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  segmentActive: { backgroundColor: '#111' },
  segmentText: { color: '#52605c', fontWeight: '700' },
  segmentTextActive: { color: '#fff' },
  progress: { color: '#52605c', textAlign: 'center', fontWeight: '600' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 14, height: 14, borderWidth: 1 },
  visitedSwatch: { backgroundColor: '#111', borderColor: '#111' },
  unvisitedSwatch: { backgroundColor: '#fff', borderColor: '#929b98' },
  selectedSwatch: { backgroundColor: '#fff', borderColor: '#c69214', borderWidth: 2 },
  legendText: { color: '#66736f', fontSize: 12 },
  selectedCard: { backgroundColor: '#fffaf0', borderColor: '#dfc170', borderWidth: 1, borderRadius: radius.sm, padding: spacing.md, gap: spacing.sm },
  selectedName: { color: colors.text, fontSize: 20, fontWeight: '700' },
  selectedCount: { color: '#66582f' },
  visitRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#ded5bc', paddingTop: spacing.sm },
  visitText: { flex: 1, gap: 2 },
  visitName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  visitDate: { color: '#746d5c', fontSize: 12 },
  visitArrow: { color: '#746d5c', fontSize: 22 },
  pressed: { opacity: 0.65 },
  empty: { color: '#66736f', textAlign: 'center', paddingVertical: spacing.lg },
  list: { gap: spacing.sm },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  regionRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccd3d0' },
  regionName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  regionCount: { color: '#52605c' },
  notice: { alignItems: 'center', gap: spacing.md },
  error: { color: '#b33030', textAlign: 'center' },
  retry: { minHeight: 48, borderWidth: 1, borderColor: '#adb7b3', borderRadius: radius.sm, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  credit: { color: '#7b8582', fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
