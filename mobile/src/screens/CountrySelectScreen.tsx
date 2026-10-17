// 国名から選ぶ画面です（Figma の「国名から選ぶ」）。
// 12か国を2列で並べ、国名で絞り込めます。国カードを押すと、その国の料理のお店を地図で探せます。

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CountryCard } from '../components/CountryCard';
import { Header } from '../components/Header';
import { SearchField } from '../components/SearchField';
import { colors, fonts, spacing } from '../constants/theme';
import { getCountries } from '../data/api';
import type { Country } from '../data/types';

const GRID_GAP = spacing.md;

export function CountrySelectScreen() {
  const { width } = useWindowDimensions();
  const [countries, setCountries] = useState<Country[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    getCountries().then(result => {
      if (active) setCountries(result);
    });
    return () => {
      active = false;
    };
  }, []);

  // 国名・料理名のどちらかに入力した文字が含まれる国だけ表示します
  const keyword = query.trim();
  const filtered = countries.filter(
    country => keyword === '' || country.name.includes(keyword) || country.cuisineName.includes(keyword),
  );
  const cardWidth = (width - spacing.screen * 2 - GRID_GAP) / 2;

  return (
    <View style={styles.screen}>
      <Header title="国名から選ぶ" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SearchField value={query} onChangeText={setQuery} placeholder="国名で検索" />
        <View style={styles.grid}>
          {filtered.map(country => (
            <CountryCard
              key={country.code}
              country={country}
              width={cardWidth}
              onPress={item => router.push(`/shops/${item.code}`)}
            />
          ))}
        </View>
        {countries.length > 0 && filtered.length === 0 && (
          <Text style={styles.empty}>「{keyword}」に合う国が見つかりませんでした</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  empty: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
