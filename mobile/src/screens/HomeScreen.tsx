// ホーム画面（Figma の「home」）です。
// 上から「おすすめの国特集」「国名から選ぶ」「今まで訪れたお店」の順に並びます。

import { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { CountryCard } from '../components/CountryCard';
import { FeaturedBanner } from '../components/FeaturedBanner';
import { SectionHeader } from '../components/SectionHeader';
import { VisitedShopCard } from '../components/VisitedShopCard';
import { colors, spacing } from '../constants/theme';
import { findCountry, getHomeData } from '../data/api';
import type { HomeData } from '../data/types';

// 2列のカードの間のすき間
const GRID_GAP = spacing.md;
// 横スクロールの国カードの幅
const COUNTRY_CARD_WIDTH = 136;

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const [data, setData] = useState<HomeData | null>(null);

  // データを読み込みます（今はダミーデータ。src/data/api.ts を参照）
  useEffect(() => {
    let active = true;
    getHomeData().then(result => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, []);

  // バナーが暗い色なので、ホームを表示している間だけ時計などの文字を白にします
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  if (!data) return <View style={styles.screen} />;

  // 2列のカードの幅 =（画面の幅 − 左右の余白 − カードの間のすき間）÷ 2
  const shopCardWidth = (width - spacing.screen * 2 - GRID_GAP) / 2;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FeaturedBanner title="おすすめの国特集" items={data.featured} />

      <View style={styles.firstSectionHeader}>
        <SectionHeader
          title="国名から選ぶ"
          onPressMore={() => {
            // TODO: 「国名から選ぶ」画面ができたら、ここで移動します
          }}
        />
      </View>
      <FlatList
        data={data.countries}
        keyExtractor={country => country.code}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.countryList}
        renderItem={({ item }) => <CountryCard country={item} width={COUNTRY_CARD_WIDTH} />}
      />

      <View style={styles.sectionHeader}>
        <SectionHeader title="今まで訪れたお店" />
      </View>
      <View style={styles.shopGrid}>
        {data.visitedShops.map(shop => (
          <VisitedShopCard
            key={shop.id}
            shop={shop}
            country={findCountry(shop.countryCode)}
            width={shopCardWidth}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  // 余白はすべて8の倍数（theme.ts の spacing）です
  firstSectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.screen,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.screen,
  },
  countryList: {
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screen,
    columnGap: GRID_GAP,
    rowGap: spacing.lg,
  },
});
