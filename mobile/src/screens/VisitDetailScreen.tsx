import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '../constants/theme';
import type { VisitRecord } from '../data/visitTypes';
import { getVisitById } from '../repositories/visitRepository';

type DetailState =
  | { status: 'loading' }
  | { status: 'ready'; visit: VisitRecord }
  | { status: 'missing' };

export function VisitDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const [state, setState] = useState<DetailState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    if (!id) return () => { active = false; };
    void getVisitById(id)
      .then(visit => {
        if (active) setState(visit ? { status: 'ready', visit } : { status: 'missing' });
      })
      .catch(() => {
        if (active) setState({ status: 'missing' });
      });
    return () => { active = false; };
  }, [id]);

  if (!id || state.status === 'missing') {
    return (
      <SafeAreaView edges={[]} style={[styles.safeArea, styles.centered]}>
        <Text accessibilityRole="alert" style={styles.error}>訪問記録が見つかりませんでした。</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>戻る</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (state.status === 'loading') {
    return (
      <SafeAreaView edges={[]} style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator accessibilityLabel="訪問記録を読み込み中" color={colors.tabActive} />
      </SafeAreaView>
    );
  }

  const { visit } = state;
  const verified = visit.verification.status === 'verified';

  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>VISIT RECORD</Text>
          <Text accessibilityRole="header" style={styles.title}>{visit.shopName}</Text>
          <Text style={styles.date}>{new Date(visit.visitedAt).toLocaleString('ja-JP')}</Text>
          {visit.address && <Text style={styles.address}>{visit.address}</Text>}
          <Text style={[styles.badge, verified ? styles.verifiedBadge : styles.unverifiedBadge]}>
            {verified ? '現在地で確認済み' : '未確認の記録'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.heading}>写真</Text>
          {visit.photoUris.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
              {visit.photoUris.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  accessibilityLabel={`${index + 1}枚目の訪問写真`}
                  source={{ uri }}
                  style={styles.photo}
                />
              ))}
            </ScrollView>
          ) : <Text style={styles.empty}>写真はありません。</Text>}
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.heading}>メモ</Text>
          <Text style={visit.memo ? styles.memo : styles.empty}>{visit.memo || 'メモはありません。'}</Text>
        </View>

        {verified && (visit.verification.distanceMeters !== null || visit.verification.accuracyMeters !== null) && (
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>訪問確認</Text>
            {visit.verification.distanceMeters !== null && <Text style={styles.detail}>店舗までの距離：約{visit.verification.distanceMeters.toLocaleString()}m</Text>}
            {visit.verification.accuracyMeters !== null && <Text style={styles.detail}>位置情報の精度：約{visit.verification.accuracyMeters.toLocaleString()}m</Text>}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.screen },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: spacing.screen, paddingBottom: 48, gap: spacing.lg },
  header: { gap: spacing.sm, alignItems: 'flex-start' },
  eyebrow: { color: '#66736f', fontSize: 12, letterSpacing: 2 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  date: { color: '#52645f', fontSize: 14 },
  address: { color: '#52645f', fontSize: 14, lineHeight: 21 },
  badge: { overflow: 'hidden', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, fontSize: 12, fontWeight: '700' },
  verifiedBadge: { color: '#17613d', backgroundColor: '#e8f4ed' },
  unverifiedBadge: { color: '#66582f', backgroundColor: '#fff4d6' },
  section: { gap: spacing.sm },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  photos: { gap: spacing.sm },
  photo: { width: 240, height: 240, borderRadius: radius.sm, backgroundColor: '#e7ebe9' },
  memo: { color: colors.text, fontSize: 15, lineHeight: 24, backgroundColor: '#f5f6f5', borderRadius: radius.sm, padding: spacing.md },
  empty: { color: '#66736f', fontSize: 14 },
  detail: { color: '#52645f', fontSize: 14, lineHeight: 21 },
  error: { color: '#b33030', lineHeight: 22, textAlign: 'center' },
  backButton: { minHeight: 48, minWidth: 120, borderRadius: radius.sm, backgroundColor: colors.tabActive, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  backButtonText: { color: colors.textOnDark, fontWeight: '700' },
});
