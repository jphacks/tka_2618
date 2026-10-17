import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import RestaurantMap from './RestaurantMap';

type Country = {
  code: string;
  name_ja: string;
  flag: string;
  cuisine_supported: boolean;
};

type Restaurant = {
  id: string;
  name: string;
  distance_m: number;
  address: string | null;
  lat: number;
  lng: number;
  genre: string | null;
  image_url: string | null;
  detail_url: string | null;
};

type LoadState = 'loading' | 'ready' | 'error';
type SearchState = 'idle' | 'locating' | 'searching' | 'success' | 'error';

const configuredApiUrl = Platform.OS === 'web'
  ? process.env.EXPO_PUBLIC_WEB_API_URL ?? 'http://localhost:8001'
  : process.env.EXPO_PUBLIC_API_URL;
const apiUrl = configuredApiUrl?.trim().replace(/\/+$/, '');

export default function App() {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadError, setLoadError] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('JP');
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchMessage, setSearchMessage] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCountries() {
      if (!apiUrl || !/^https?:\/\//.test(apiUrl)) {
        setLoadError('mobile/.envにAPIのURLを設定してください。');
        setLoadState('error');
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/api/countries`, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload: unknown = await response.json();
        if (!payload || typeof payload !== 'object' || !('countries' in payload) || !Array.isArray(payload.countries)) {
          throw new Error('国一覧のレスポンスが不正です');
        }
        const available = (payload.countries as Country[]).filter(country => country.cuisine_supported);
        setCountries(available);
        setSelectedCountry(available.some(country => country.code === 'JP') ? 'JP' : available[0]?.code ?? '');
        setLoadState('ready');
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setLoadError('バックエンドから国一覧を取得できませんでした。');
        setLoadState('error');
      }
    }

    void loadCountries();
    return () => controller.abort();
  }, []);

  async function searchNearby() {
    if (!apiUrl || !selectedCountry) return;
    setRestaurants([]);
    setSearchCenter(null);
    setSearchMessage('');
    setSearchState('locating');

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setSearchMessage('現在地を使うには、位置情報の利用を許可してください。');
        setSearchState('error');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setSearchCenter({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setSearchState('searching');
      const query = [
        `country_code=${encodeURIComponent(selectedCountry)}`,
        `lat=${location.coords.latitude}`,
        `lng=${location.coords.longitude}`,
        'count=30',
      ].join('&');
      const response = await fetch(`${apiUrl}/api/restaurants/nearby?${query}`);
      const payload: unknown = await response.json();
      if (!response.ok) {
        const detail = payload && typeof payload === 'object' && 'detail' in payload && typeof payload.detail === 'string'
          ? payload.detail
          : `検索に失敗しました（HTTP ${response.status}）`;
        throw new Error(detail);
      }
      if (!payload || typeof payload !== 'object' || !('restaurants' in payload) || !Array.isArray(payload.restaurants)) {
        throw new Error('店舗検索のレスポンスが不正です。');
      }
      setRestaurants(payload.restaurants as Restaurant[]);
      setSearchState('success');
    } catch (error) {
      setSearchMessage(error instanceof Error ? error.message : '店舗を検索できませんでした。');
      setSearchState('error');
    }
  }

  const searching = searchState === 'locating' || searchState === 'searching';
  const selected = countries.find(country => country.code === selectedCountry);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.eyebrow}>WORLD FOOD NEARBY</Text>
          <Text accessibilityRole="header" style={styles.title}>近くの世界料理を探す</Text>
          <Text style={styles.intro}>食べたい国を選ぶと、現在地から3km以内のお店を表示します。</Text>

          {loadState === 'loading' && <ActivityIndicator color="#215a49" style={styles.loader} />}
          {loadState === 'error' && (
            <View style={styles.notice}>
              <Text style={styles.error}>{loadError}</Text>
            </View>
          )}

          {loadState === 'ready' && (
            <>
              <Text accessibilityRole="header" style={styles.sectionTitle}>料理の国</Text>
              <View style={styles.countryGrid}>
                {countries.map(country => {
                  const active = country.code === selectedCountry;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      key={country.code}
                      onPress={() => {
                        setSelectedCountry(country.code);
                        setRestaurants([]);
                        setSearchCenter(null);
                        setSearchState('idle');
                      }}
                      style={({ pressed }) => [styles.countryButton, active && styles.countryButtonActive, pressed && styles.pressed]}
                    >
                      <Text style={styles.flag}>{country.flag}</Text>
                      <Text style={[styles.countryName, active && styles.countryNameActive]}>{country.name_ja}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: searching }}
                disabled={searching}
                onPress={() => void searchNearby()}
                style={({ pressed }) => [styles.searchButton, (pressed || searching) && styles.pressed]}
              >
                {searching ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchButtonText}>{selected?.flag} 3km以内を検索</Text>}
              </Pressable>
              {searching && <Text style={styles.statusText}>{searchState === 'locating' ? '現在地を取得しています…' : 'お店を検索しています…'}</Text>}
              {searchState === 'error' && <Text style={styles.error}>{searchMessage}</Text>}
              {searchState === 'success' && restaurants.length === 0 && (
                <Text style={styles.empty}>3km以内に該当するお店が見つかりませんでした。</Text>
              )}

              {searchState === 'success' && searchCenter && (
                <View style={styles.mapSection}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>地図</Text>
                  <RestaurantMap center={searchCenter} restaurants={restaurants} />
                </View>
              )}

              {restaurants.length > 0 && (
                <View style={styles.results}>
                  <Text accessibilityRole="header" style={styles.sectionTitle}>{restaurants.length}件のお店</Text>
                  {restaurants.map(restaurant => (
                    <View key={restaurant.id} style={styles.restaurantCard}>
                      {restaurant.image_url && <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />}
                      <View style={styles.restaurantBody}>
                        <Text style={styles.distance}>{restaurant.distance_m.toLocaleString()}m</Text>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        {restaurant.genre && <Text style={styles.meta}>{restaurant.genre}</Text>}
                        {restaurant.address && <Text style={styles.meta}>{restaurant.address}</Text>}
                        {restaurant.detail_url && (
                          <Pressable onPress={() => void Linking.openURL(restaurant.detail_url as string)}>
                            <Text style={styles.link}>店舗詳細を見る</Text>
                          </Pressable>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <Pressable
                accessibilityRole="link"
                onPress={() => void Linking.openURL('https://webservice.recruit.co.jp/')}
                style={styles.credit}
              >
                <Image
                  accessibilityLabel="ホットペッパーグルメ Webサービス"
                  source={{ uri: 'https://webservice.recruit.co.jp/banner/hotpepper-s.gif' }}
                  style={styles.creditImage}
                />
              </Pressable>
              <Text style={styles.privacy}>現在地は検索時だけ使用し、保存しません。</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7f3' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  eyebrow: { color: '#487468', letterSpacing: 2, fontSize: 12, fontWeight: '700', marginTop: 20 },
  title: { color: '#19312c', fontSize: 32, fontWeight: '700', marginTop: 12 },
  intro: { color: '#52645f', fontSize: 16, lineHeight: 25, marginTop: 12 },
  loader: { marginTop: 40 },
  notice: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginTop: 28 },
  sectionTitle: { color: '#19312c', fontSize: 18, fontWeight: '700', marginTop: 30, marginBottom: 14 },
  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  countryButton: { minWidth: 100, flexGrow: 1, flexBasis: '29%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#dce5df', borderRadius: 12, padding: 12, alignItems: 'center' },
  countryButtonActive: { backgroundColor: '#215a49', borderColor: '#215a49' },
  flag: { fontSize: 26, marginBottom: 5 },
  countryName: { color: '#29443d', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  countryNameActive: { color: '#fff' },
  searchButton: { backgroundColor: '#d94b35', minHeight: 52, borderRadius: 12, marginTop: 24, padding: 14, alignItems: 'center', justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.65 },
  statusText: { color: '#52645f', textAlign: 'center', marginTop: 12 },
  error: { color: '#b33030', fontSize: 15, lineHeight: 23, marginTop: 12 },
  empty: { color: '#52645f', backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 20 },
  results: { marginTop: 4 },
  mapSection: { marginTop: 4 },
  restaurantCard: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#dce5df' },
  restaurantImage: { width: '100%', height: 180, backgroundColor: '#e4e9e6' },
  restaurantBody: { padding: 16 },
  distance: { alignSelf: 'flex-start', color: '#17613d', backgroundColor: '#e8f4ed', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, fontSize: 13, fontWeight: '700' },
  restaurantName: { color: '#19312c', fontSize: 18, fontWeight: '700', marginTop: 10 },
  meta: { color: '#52645f', fontSize: 14, lineHeight: 21, marginTop: 5 },
  link: { color: '#17613d', fontSize: 15, fontWeight: '700', marginTop: 12 },
  credit: { alignSelf: 'flex-start', marginTop: 18, paddingVertical: 8 },
  creditImage: { width: 135, height: 17 },
  privacy: { color: '#6f7d79', fontSize: 12, marginTop: 8 },
});
