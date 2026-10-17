import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import RestaurantMap from '../../RestaurantMap';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { ExternalLinkIcon } from '../components/Icons';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { findCountry, getNearbyRestaurants } from '../data/api';
import type { Restaurant } from '../data/visitTypes';

const SEARCH_TIMEOUT_MS = 30_000;

type SearchState =
  | { status: 'locating' }
  | { status: 'searching' }
  | { status: 'success'; center: { latitude: number; longitude: number }; restaurants: Restaurant[] }
  | { status: 'error'; message: string };

export function ShopMapScreen() {
  const { countryCode } = useLocalSearchParams<{ countryCode: string }>();
  const country = findCountry(countryCode);
  const [state, setState] = useState<SearchState>({ status: 'locating' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!country) return;
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
        const result = await getNearbyRestaurants(selectedCountry.code, center, controller.signal);
        if (!active) return;
        setSelectedId(result.restaurants[0]?.id ?? null);
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
  }, [attempt, country]);

  if (!country) {
    return (
      <View style={styles.screen}>
        <Header title="お店を探す" showBack />
        <Text style={styles.notFound}>国が見つかりませんでした</Text>
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

  return (
    <View style={styles.screen}>
      <Header title={`${country.cuisineName}のお店`} showBack />
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultCount}>3km以内に{state.restaurants.length}件</Text>
            <Text style={styles.privacy}>現在地は検索時だけ使用し、保存しません。</Text>
          </View>
          {state.restaurants.length > 0 ? (
            <>
              <RestaurantMap
                center={state.center}
                onSelect={restaurant => setSelectedId(restaurant.id)}
                restaurants={state.restaurants}
                selectedId={selectedId}
              />
              {selected && (
                <View style={styles.shopCard}>
                  {selected.image_url && <Image source={{ uri: selected.image_url }} style={styles.shopImage} />}
                  <View style={styles.shopBody}>
                    <Text style={styles.distance}>現在地から{selected.distance_m.toLocaleString()}m</Text>
                    <Text style={styles.shopName}>{selected.name}</Text>
                    {selected.genre && <Text style={styles.shopInfo}>{selected.genre}</Text>}
                    {selected.address && <Text style={styles.shopInfo}>{selected.address}</Text>}
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
                  </View>
                </View>
              )}
            </>
          ) : <Text style={styles.empty}>3km以内に該当するお店が見つかりませんでした。</Text>}
          <Button title="現在地を再取得" onPress={retry} variant="secondary" />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.screen },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: spacing.screen, paddingBottom: spacing.xl, gap: spacing.lg },
  notFound: { ...fonts.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  status: { ...fonts.body, color: colors.textSecondary, textAlign: 'center' },
  error: { ...fonts.body, color: '#b33030', textAlign: 'center' },
  resultHeader: { gap: 4 },
  resultCount: { ...fonts.bodyBold, color: colors.text },
  privacy: { ...fonts.caption, color: colors.textSecondary },
  shopCard: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.background },
  shopImage: { width: '100%', height: 180, backgroundColor: colors.imagePlaceholder },
  shopBody: { gap: spacing.sm, padding: spacing.md },
  distance: { ...fonts.label, color: colors.textSecondary },
  shopName: { ...fonts.cardTitle, color: colors.text },
  shopInfo: { ...fonts.body, color: colors.textSecondary },
  shopLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, marginTop: spacing.sm },
  shopLinkText: { ...fonts.bodyBold, color: colors.text },
  empty: { ...fonts.body, color: colors.textSecondary, textAlign: 'center', paddingVertical: spacing.xl },
  pressed: { opacity: 0.6 },
});
