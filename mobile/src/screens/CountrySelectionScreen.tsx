import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { DemoModeNotice } from '../components/DemoModeNotice';
import { demoRestaurants } from '../data/demoVisits';
import { searchApi, type Prefecture, type SearchCountry } from '../data/searchApi';
import { useDemoMode } from '../providers/DemoModeProvider';

const areas = [
  { name: '北海道・東北', min: 1, max: 7 },
  { name: '関東', min: 8, max: 14 },
  { name: '中部', min: 15, max: 23 },
  { name: '近畿', min: 24, max: 30 },
  { name: '中国', min: 31, max: 35 },
  { name: '四国', min: 36, max: 39 },
  { name: '九州・沖縄', min: 40, max: 47 },
];

export function CountrySelectionScreen({ prefectures = false }: { prefectures?: boolean }) {
  const demoMode = useDemoMode();
  const [items, setItems] = useState<(Prefecture & { flag?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (demoMode.enabled) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;
    async function load() {
      try {
        const items = prefectures
          ? (await searchApi<{ regions: Prefecture[] }>('/api/countries/JP/regions', controller.signal)).regions
          : (await searchApi<{ countries: SearchCountry[] }>('/api/countries', controller.signal)).countries.filter(item => item.cuisine_supported);
        if (active) setItems(items);
      } catch {
        if (active) setError(`${prefectures ? '都道府県' : '国'}一覧を取得できませんでした。バックエンドの接続を確認してください。`);
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [demoMode.enabled, prefectures, attempt]);

  const sections = prefectures
    ? areas.map(area => ({ name: area.name, items: items.filter(item => {
      const number = Number(item.code.slice(3));
      return number >= area.min && number <= area.max;
    }) }))
    : [{ name: '料理の国', items }];

  return (
    <SafeAreaView edges={[]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{demoMode.enabled ? 'PRESENTATION DEMO' : prefectures ? 'JAPANESE LOCAL FOOD' : 'WORLD FOOD NEARBY'}</Text>
        <Text accessibilityRole="header" style={styles.title}>{demoMode.enabled ? 'デモ店舗を選ぶ' : prefectures ? 'どこの郷土料理を食べる？' : '近くの世界料理を探す'}</Text>
        <Text style={styles.intro}>{demoMode.enabled
          ? '現在地を使わず、固定店舗から訪問登録とスタンプ地図を確認できます。'
          : prefectures
          ? '都道府県を選ぶと、現在地から3km以内でその地域の料理を探します。'
          : '国を選ぶと、現在地から3km以内のお店を地図に表示します。日本は都道府県から選べます。'}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/map')} style={({ pressed }) => [styles.stampButton, pressed && styles.pressed]}>
          <Text style={styles.stampButtonText}>旅のスタンプ地図を見る ›</Text>
        </Pressable>
        {demoMode.enabled && <DemoModeNotice />}
        {demoMode.enabled && (
          <View style={styles.demoSection}>
            <Text accessibilityRole="header" style={styles.demoHeading}>固定デモ店舗</Text>
            <Text style={styles.demoHelp}>訪問登録後、対象の国または都道府県が黒くなります。</Text>
            {demoRestaurants.map(restaurant => (
              <Pressable
                key={restaurant.id}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/map/visit', params: {
                  shopId: restaurant.id,
                  shopName: restaurant.name,
                  latitude: String(restaurant.latitude),
                  longitude: String(restaurant.longitude),
                  country: restaurant.countryCode,
                  ...(restaurant.prefectureCode ? { region: restaurant.prefectureCode } : {}),
                  address: restaurant.address,
                } })}
                style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}
              >
                <Text style={styles.demoButtonText}>{restaurant.label} ›</Text>
              </Pressable>
            ))}
          </View>
        )}
        {!demoMode.enabled && loading && <ActivityIndicator accessibilityLabel="一覧を読み込み中" />}
        {!demoMode.enabled && (error ? <View style={styles.notice}>
          <Text accessibilityRole="alert">{error}</Text>
          <Pressable accessibilityRole="button" style={styles.button} onPress={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}><Text>再読み込み</Text></Pressable>
        </View> : !loading && sections.map(section => (
          <View key={section.name}>
            <Text accessibilityRole="header" style={styles.heading}>{section.name}</Text>
            <View style={styles.grid}>
              {section.items.map(item => (
                <Pressable key={item.code} accessibilityRole="button" accessibilityLabel={item.name_ja}
                  onPress={() => {
                    if (!prefectures && item.code === 'JP') router.push('/map/prefectures');
                    else router.push({ pathname: '/map/results', params: {
                      country: prefectures ? 'JP' : item.code,
                      ...(prefectures ? { region: item.code } : {}),
                    } });
                  }}
                  style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                  {item.flag && <Text style={styles.flag}>{item.flag}</Text>}
                  <Text style={styles.label}>{item.name_ja} ›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))) }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: spacing.screen, gap: spacing.lg },
  eyebrow: { fontSize: 12, letterSpacing: 2, color: '#666' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  intro: { fontSize: 15, lineHeight: 24, color: '#555' },
  heading: { fontSize: 18, fontWeight: '600', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  button: { flexGrow: 1, flexBasis: '28%', minWidth: 90, minHeight: 56, padding: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  flag: { fontSize: 28 },
  label: { fontSize: 14, fontWeight: '600' },
  pressed: { opacity: 0.5 },
  stampButton: { minHeight: 52, borderRadius: 14, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  stampButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  demoSection: { gap: 10, backgroundColor: '#eef7f1', borderRadius: 14, padding: 16 },
  demoHeading: { color: '#153d2b', fontSize: 17, fontWeight: '700' },
  demoHelp: { color: '#4f675c', fontSize: 13, lineHeight: 20 },
  demoButton: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#90bca5', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  demoButtonText: { color: '#17613d', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  notice: { gap: 16 },
});
