import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { searchApi, type SearchCountry, type Prefecture } from '../data/searchApi';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import RestaurantMap from '../../RestaurantMap';
import { colors, spacing } from '../constants/theme';

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

type SearchState = 'locating' | 'searching' | 'success' | 'error';
type SearchResult = { restaurants: Restaurant[]; cuisine_name: string; search_keyword: string };

export function MapScreen() {
  const params = useLocalSearchParams<{ country?: string | string[]; region?: string | string[] }>();
  const country = typeof params.country === 'string' ? params.country.toUpperCase() : '';
  const region = typeof params.region === 'string' ? params.region.toUpperCase() : '';
  return <SearchResults key={`${country}:${region}`} country={country} region={region} />;
}

function SearchResults({ country, region }: { country: string; region: string }) {
  const [title, setTitle] = useState('近くのお店');
  const [keyword, setKeyword] = useState('');
  const [searchState, setSearchState] = useState<SearchState>('locating');
  const [searchMessage, setSearchMessage] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchCenter, setSearchCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => {
      if (!active) return;
      active = false;
      controller.abort();
      setSearchState('error');
      setSearchMessage('検索に時間がかかっています。位置情報と通信環境を確認して、もう一度お試しください。');
    }, 30000);

    async function search() {
      try {
        // URLを直接開いた場合も、対応する国・都道府県か確認してから位置情報を取得する。
        const catalog = await searchApi<{ countries: SearchCountry[] }>('/api/countries', controller.signal);
        const selected = catalog.countries.find(item => item.code === country && item.cuisine_supported);
        if (!selected || (region && country !== 'JP')) throw new Error('国を選び直してください。');
        let name = `${selected.name_ja}の料理`;
        if (country === 'JP') {
          if (!region) throw new Error('日本の料理は都道府県を選んでください。');
          const catalog = await searchApi<{ regions: Prefecture[] }>('/api/countries/JP/regions', controller.signal);
          const selectedRegion = catalog.regions.find(item => item.code === region);
          if (!selectedRegion) throw new Error('都道府県を選び直してください。');
          name = `${selectedRegion.name_ja}の郷土料理`;
        }
        if (!active) return;
        setTitle(name);
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (permission.status !== 'granted') throw new Error('近くのお店を探すには、ブラウザまたは端末の設定で位置情報の利用を許可してください。');
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!active) return;
        const center = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setSearchCenter(center);
        setSearchState('searching');
        const query = new URLSearchParams({ country_code: country, lat: String(center.latitude), lng: String(center.longitude), count: '30' });
        if (region) query.set('region_code', region);
        const result = await searchApi<SearchResult>(`/api/restaurants/nearby?${query}`, controller.signal);
        if (!Array.isArray(result.restaurants)) throw new Error('店舗検索のレスポンスが不正です。');
        if (!active) return;
        setRestaurants(result.restaurants);
        setKeyword(result.search_keyword);
        setTitle(result.cuisine_name);
        setSearchState('success');
      } catch (error) {
        if (active) {
          setSearchMessage(error instanceof Error ? error.message : '店舗を検索できませんでした。');
          setSearchState('error');
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    void search();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [country, region, attempt]);

  const searching = searchState === 'locating' || searchState === 'searching';

  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace(country === 'JP' ? '/map/prefectures' : '/map')}>
          <Text style={styles.link}>‹ 選び直す</Text>
        </Pressable>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.intro}>現在地から3km以内のお店を探します。</Text>
        {keyword ? <Text style={styles.meta}>検索キーワード：{keyword}</Text> : null}
        {region && <Text style={styles.meta}>料理名のキーワード検索です。お店の掲載情報によって、該当しない場合があります。</Text>}
        {searching && <ActivityIndicator color={colors.tabActive} style={styles.loader} />}
        {!searching && <Pressable accessibilityRole="button" onPress={() => {
          setSearchState('locating'); setSearchMessage(''); setRestaurants([]);
          setSearchCenter(null); setKeyword(''); setAttempt(value => value + 1);
        }} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>{searchState === 'error' ? 'もう一度試す' : '現在地で再検索'}</Text>
        </Pressable>}
        {searching && <Text style={styles.statusText}>{searchState === 'locating' ? '現在地を取得しています…' : 'お店を検索しています…'}</Text>}
        {searchState === 'error' && <Text style={styles.error}>{searchMessage}</Text>}
        {searchState === 'success' && restaurants.length === 0 && (
          <Text style={styles.empty}>3km以内に該当するお店が見つかりませんでした。</Text>
        )}

        {searchCenter && (
          <View style={styles.mapSection}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>地図</Text>
            <RestaurantMap key={`${searchCenter.latitude}:${searchCenter.longitude}:${searchState}`} center={searchCenter} restaurants={restaurants} />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: spacing.screen, paddingBottom: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: '700', marginTop: 12 },
  intro: { color: '#52645f', fontSize: 16, lineHeight: 25, marginTop: 12 },
  loader: { marginTop: 40 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 30, marginBottom: 14 },
  searchButton: { backgroundColor: colors.tabActive, minHeight: 52, borderRadius: 12, marginTop: 24, padding: 14, alignItems: 'center', justifyContent: 'center' },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statusText: { color: '#52645f', textAlign: 'center', marginTop: 12 },
  error: { color: '#b33030', fontSize: 15, lineHeight: 23, marginTop: 12 },
  empty: { color: '#52645f', backgroundColor: '#fff', borderRadius: 12, padding: 18, marginTop: 20 },
  results: { marginTop: 4 },
  mapSection: { marginTop: 4 },
  restaurantCard: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#dce5df' },
  restaurantImage: { width: '100%', height: 180, backgroundColor: '#e4e9e6' },
  restaurantBody: { padding: 16 },
  distance: { alignSelf: 'flex-start', color: '#17613d', backgroundColor: '#e8f4ed', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, fontSize: 13, fontWeight: '700' },
  restaurantName: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 10 },
  meta: { color: '#52645f', fontSize: 14, lineHeight: 21, marginTop: 5 },
  link: { color: '#17613d', fontSize: 15, fontWeight: '700', marginTop: 12 },
  credit: { alignSelf: 'flex-start', marginTop: 18, paddingVertical: 8 },
  creditImage: { width: 135, height: 17 },
  privacy: { color: '#6f7d79', fontSize: 12, marginTop: 8 },
});
