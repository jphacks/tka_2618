import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import RestaurantMap from '../../RestaurantMap';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { CloseIcon, ExternalLinkIcon } from '../components/Icons';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { findCountry, getNearbyRestaurants } from '../data/api';
import { useAppData } from '../data/AppDataContext';
import { japanMapShapes } from '../data/japanMapShapes';
import type { Restaurant } from '../data/visitTypes';
import { formatDateTime } from '../utils/date';

const SEARCH_TIMEOUT_MS = 30_000;

type SearchState =
  | { status: 'locating' }
  | { status: 'searching' }
  | { status: 'success'; center: { latitude: number; longitude: number }; restaurants: Restaurant[] }
  | { status: 'error'; message: string };

export function ShopMapScreen() {
  const { countryCode, regionCode } = useLocalSearchParams<{ countryCode: string; regionCode?: string }>();
  const country = findCountry(countryCode);
  const region = country?.code === 'JP' ? japanMapShapes.find(item => item.code === regionCode) : undefined;
  const requiresRegionSelection = country?.code === 'JP' && !region;
  const { reservations } = useAppData();
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<SearchState>({ status: 'locating' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!country || requiresRegionSelection) return;
    const selectedCountry = country;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
    let active = true;

    async function load() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (permission.status !== 'granted') {
          setState({ status: 'error', message: '近くのお店を探すには、ブラウザまたは端末の設定で位置情報の利用を許可してください。' });
          return;
        }

        let location: Location.LocationObject;
        try {
          location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        } catch {
          if (active) setState({ status: 'error', message: '現在地を取得できませんでした。位置情報を確認して、もう一度お試しください。' });
          return;
        }
        if (!active) return;
        const center = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setState({ status: 'searching' });
        const result = await getNearbyRestaurants(selectedCountry.code, center, controller.signal, region?.code);
        if (!active) return;
        setSelectedId(null);
        setState({ status: 'success', center, restaurants: result.restaurants });
      } catch (error) {
        if (!active) return;
        const message = controller.signal.aborted
          ? '店舗の検索に時間がかかっています。通信環境を確認して、もう一度お試しください。'
          : error instanceof Error ? error.message : '店舗を検索できませんでした。';
        setState({ status: 'error', message });
      } finally {
        clearTimeout(timeout);
      }
    }

    void load();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt, country, region, requiresRegionSelection]);

  if (!country) {
    return (
      <View style={styles.screen}>
        <Header title="お店を探す" showBack />
        <Text style={styles.notFound}>国が見つかりませんでした</Text>
      </View>
    );
  }

  if (requiresRegionSelection) {
    return (
      <View style={styles.screen}>
        <Header title="日本のお店" showBack />
        <View style={styles.centered}>
          <Text style={styles.notFound}>都道府県を選んでください</Text>
          <Button title="都道府県を選ぶ" onPress={() => router.replace('/prefectures')} />
        </View>
      </View>
    );
  }

  const retry = () => {
    setSelectedId(null);
    setState({ status: 'locating' });
    setAttempt(value => value + 1);
  };
  const selected = state.status === 'success'
    ? state.restaurants.find(restaurant => restaurant.id === selectedId) ?? null
    : null;
  const selectedReservation = selected
    ? reservations.find(reservation =>
      reservation.shopId === selected.id
      || (
        !reservation.shopId
        && reservation.countryCode === country.code
        && reservation.shopName.trim().toLocaleLowerCase() === selected.name.trim().toLocaleLowerCase()
      ),
    )
    : undefined;

  const openReservationForm = () => {
    if (!selected) return;
    const info = [selected.genre, selected.address].filter(value => value !== null).join('・');
    const prefectureCode = country.code === 'JP'
      ? region?.code ?? japanMapShapes.find(prefecture => selected.address?.includes(prefecture.name))?.code
      : undefined;
    router.push({
      pathname: '/reservations/new',
      params: {
        shopId: selected.id,
        shopName: selected.name,
        countryCode: country.code,
        ...(prefectureCode ? { prefectureCode } : {}),
        ...(selected.image_url ? { imageUrl: selected.image_url } : {}),
        ...(info ? { info } : {}),
      },
    });
  };

  return (
    <View style={styles.screen}>
      <Header title={region ? `${region.name}の郷土料理` : `${country.cuisineName}のお店`} showBack />
      {state.status === 'locating' || state.status === 'searching' ? (
        <View style={styles.centered}>
          <ActivityIndicator accessibilityLabel={state.status === 'locating' ? '現在地を取得中' : '近くのお店を検索中'} color={colors.primary} />
          <Text style={styles.status}>{state.status === 'locating' ? '現在地を取得しています…' : '近くのお店を検索しています…'}</Text>
        </View>
      ) : state.status === 'error' ? (
        <View style={styles.centered}>
          <Text accessibilityRole="alert" style={styles.error}>{state.message}</Text>
          <Button title="もう一度試す" onPress={retry} />
        </View>
      ) : (
        <View style={styles.mapStage}>
          <RestaurantMap
            center={state.center}
            fullScreen
            onSelect={restaurant => setSelectedId(restaurant.id)}
            restaurants={state.restaurants}
            selectedId={selectedId}
          />

          <View style={styles.mapToolbar}>
            <View style={styles.resultSummary}>
              <Text style={styles.resultCount}>3km以内に{state.restaurants.length}件</Text>
              <Text style={styles.privacy}>現在地は保存しません</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={retry}
              style={({ pressed }) => [styles.reloadButton, pressed && styles.pressed]}
            >
              <Text style={styles.reloadText}>現在地を再取得</Text>
            </Pressable>
          </View>

          {state.restaurants.length === 0 && (
            <View style={styles.emptyOverlay}>
              <Text style={styles.empty}>3km以内に該当するお店が見つかりませんでした。</Text>
            </View>
          )}

          {selected && (
            <View pointerEvents="box-none" style={[styles.bottomOverlay, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <ScrollView style={styles.shopCard} contentContainerStyle={styles.shopCardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.shopSummary}>
                    {selected.image_url && <Image source={{ uri: selected.image_url }} style={styles.shopImage} />}
                    <View style={styles.shopTitleArea}>
                      <Text style={styles.distance}>現在地から{selected.distance_m.toLocaleString()}m</Text>
                      <Text style={styles.shopName}>{selected.name}</Text>
                      {selected.genre && <Text style={styles.shopInfo}>{selected.genre}</Text>}
                    </View>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="店舗情報を閉じる"
                    hitSlop={spacing.sm}
                    onPress={() => setSelectedId(null)}
                  >
                    <CloseIcon color={colors.text} />
                  </Pressable>
                </View>
                {selected.address && <Text style={styles.shopInfo}>{selected.address}</Text>}
                <View style={styles.reservationStatus}>
                  {selectedReservation ? (
                    <>
                      <Text style={styles.reservedLabel}>予約済み</Text>
                      <Text style={styles.reservationDate}>{formatDateTime(selectedReservation.dateTime)}</Text>
                      <Button title="予約内容を確認" variant="secondary" onPress={() => router.push('/reservations')} />
                    </>
                  ) : (
                    <>
                      <Text style={styles.reservationEmpty}>このお店の予約記録はありません</Text>
                      <Button title="予約を記録する" onPress={openReservationForm} />
                    </>
                  )}
                </View>
                {selected.detail_url && (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(selected.detail_url as string)}
                    style={({ pressed }) => [styles.shopLink, pressed && styles.pressed]}
                  >
                    <Text style={styles.shopLinkText}>店舗詳細を見る</Text>
                    <ExternalLinkIcon color={colors.textSecondary} />
                  </Pressable>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.screen },
  mapStage: { flex: 1, position: 'relative', overflow: 'hidden' },
  notFound: { ...fonts.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  status: { ...fonts.body, color: colors.textSecondary, textAlign: 'center' },
  error: { ...fonts.body, color: '#b33030', textAlign: 'center' },
  mapToolbar: { position: 'absolute', zIndex: 1000, top: spacing.md, left: spacing.md, right: spacing.md, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  resultSummary: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.background },
  resultCount: { ...fonts.bodyBold, color: colors.text },
  privacy: { ...fonts.caption, color: colors.textSecondary },
  reloadButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background },
  reloadText: { ...fonts.caption, color: colors.text, fontWeight: '700' },
  emptyOverlay: { position: 'absolute', zIndex: 1000, top: '45%', left: spacing.md, right: spacing.md, alignItems: 'center' },
  bottomOverlay: { position: 'absolute', zIndex: 1000, left: 0, right: 0, bottom: 0, alignItems: 'center', paddingHorizontal: spacing.md },
  shopCard: { width: '100%', maxWidth: 752, maxHeight: '58%', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.background, elevation: 8, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  shopCardContent: { gap: spacing.sm, padding: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  shopSummary: { flex: 1, flexDirection: 'row', gap: spacing.md },
  shopImage: { width: 88, height: 88, borderRadius: radius.md, backgroundColor: colors.imagePlaceholder },
  shopTitleArea: { flex: 1, gap: 2 },
  distance: { ...fonts.label, color: colors.textSecondary },
  shopName: { ...fonts.cardTitle, color: colors.text },
  shopInfo: { ...fonts.body, color: colors.textSecondary },
  reservationStatus: { gap: spacing.sm, marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  reservedLabel: { ...fonts.bodyBold, color: colors.text },
  reservationDate: { ...fonts.body, color: colors.textSecondary },
  reservationEmpty: { ...fonts.body, color: colors.textSecondary },
  shopLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: spacing.sm },
  shopLinkText: { ...fonts.bodyBold, color: colors.text },
  empty: { ...fonts.body, color: colors.text, textAlign: 'center', padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.background },
  pressed: { opacity: 0.6 },
});
