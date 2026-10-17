// ホーム画面（Figma の「home」）です。
// 上から「おすすめの国特集」「国名から選ぶ」「今まで訪れたお店」の順に並びます。

import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { CountryCard } from '../components/CountryCard';
import { FeaturedBanner } from '../components/FeaturedBanner';
import { SectionHeader } from '../components/SectionHeader';
import { VisitedShopCard } from '../components/VisitedShopCard';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { findCountry, getHomeData } from '../data/api';
import type { Country, HomeData } from '../data/types';

const GRID_GAP = 18;
const HOME_LOAD_TIMEOUT_MS = 15_000;

type HomeState =
  | { status: 'loading' }
  | { status: 'ready'; data: HomeData }
  | { status: 'error' };

export function HomeScreen() {
  const { width } = useWindowDimensions();
  const [state, setState] = useState<HomeState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HOME_LOAD_TIMEOUT_MS);
    let active = true;

    async function load() {
      try {
        const data = await getHomeData(controller.signal);
        if (active) setState({ status: 'ready', data });
      } catch {
        if (active) setState({ status: 'error' });
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
  }, [attempt]);

  // バナーが暗い色なので、ホームを表示している間だけ時計などの文字を白にします
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  if (state.status === 'loading') {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator accessibilityLabel="国一覧を読み込み中" color={colors.tabActive} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text accessibilityRole="alert" style={styles.errorText}>
          国一覧を取得できませんでした。バックエンドの接続を確認してください。
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setState({ status: 'loading' });
            setAttempt(value => value + 1);
          }}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryButtonText}>再読み込み</Text>
        </Pressable>
      </View>
    );
  }

  const { data } = state;

  // 2列のカードの幅 =（画面の幅 − 左右の余白 − カードの間のすき間）÷ 2
  const shopCardWidth = (width - spacing.screen * 2 - GRID_GAP) / 2;

  const openCountry = (country: Country) => {
    const countryCode = country.id.toUpperCase();
    if (countryCode === 'JP') {
      router.navigate('/map/prefectures');
      return;
    }
    router.navigate({ pathname: '/map/results', params: { country: countryCode } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <FeaturedBanner title="おすすめの国特集" items={data.featured} />

      <View style={styles.sectionHeader}>
        <SectionHeader
          title="国名から選ぶ"
          onPressMore={() => router.navigate('/map')}
        />
      </View>
      <FlatList
        data={data.countries}
        keyExtractor={country => country.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.countryList}
        renderItem={({ item }) => <CountryCard country={item} onPress={openCountry} />}
      />

      <View style={[styles.sectionHeader, styles.visitedHeader]}>
        <SectionHeader title="今まで訪れたお店" />
      </View>
      <View style={styles.shopGrid}>
        {data.visitedShops.map(shop => (
          <VisitedShopCard
            key={shop.id}
            shop={shop}
            country={findCountry(data.countries, shop.countryId)}
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.screen,
  },
  errorText: {
    ...fonts.body,
    color: colors.text,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.tabActive,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    ...fonts.body,
    color: colors.textOnDark,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    marginTop: 13,
    marginBottom: 16,
  },
  visitedHeader: {
    marginTop: 21,
    marginBottom: 21,
  },
  countryList: {
    paddingHorizontal: spacing.screen,
    gap: 14,
  },
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.screen,
    columnGap: GRID_GAP,
    rowGap: 17,
  },
});
