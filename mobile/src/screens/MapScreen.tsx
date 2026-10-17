// 地図タブです（Figma の「地図」）。世界地図と日本地図を切り替えられます。
//
// ※ 地図は見た目だけの仮実装です。世界地図の代わりに12か国を並べ、
//    食べた（写真を記録した）国を黒く塗っています。
//    あとで本物の地図（SVG の世界地図・日本地図など）に置き換えます。

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Header } from '../components/Header';
import { SegmentedControl } from '../components/SegmentedControl';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { dummyCountries } from '../data/dummy';

type MapType = 'world' | 'japan';

export function MapScreen() {
  const { visitedCountryCodes, visitedShops } = useAppData();
  const [mapType, setMapType] = useState<MapType>('world');

  return (
    <View style={styles.screen}>
      <Header title="地図" />
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl
          options={[
            { value: 'world', label: '世界地図' },
            { value: 'japan', label: '日本地図' },
          ]}
          value={mapType}
          onChange={setMapType}
        />

        {mapType === 'world' ? (
          <View style={styles.mapArea}>
            <Text style={styles.mapNote}>世界地図（仮）：食べた国が塗られます</Text>
            <Text style={styles.count}>
              食べた国 {visitedCountryCodes.size} / {dummyCountries.length}
            </Text>
            <View style={styles.countryGrid}>
              {dummyCountries.map(country => {
                const visited = visitedCountryCodes.has(country.code);
                return (
                  <View
                    key={country.code}
                    accessibilityLabel={`${country.name}${visited ? '（食べた）' : ''}`}
                    style={[styles.countryTile, visited ? styles.tileVisited : styles.tileNotVisited]}
                  >
                    <Text style={styles.tileFlag}>{country.flag}</Text>
                    <Text style={[styles.tileName, visited && styles.tileNameVisited]}>{country.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={[styles.mapArea, styles.japanArea]}>
            <Text style={styles.mapNote}>日本地図（仮）</Text>
            <Text style={styles.count}>記録したお店 {visitedShops.length} 件</Text>
            <Text style={styles.japanNote}>食べたお店がある都道府県が塗られる予定です</Text>
          </View>
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
    flexGrow: 1,
    padding: spacing.screen,
    gap: spacing.md,
  },
  mapArea: {
    flexGrow: 1,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.imagePlaceholder,
  },
  japanArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  mapNote: {
    ...fonts.bodyBold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  count: {
    ...fonts.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  japanNote: {
    ...fonts.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  countryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  countryTile: {
    // 3列で並べます
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  tileVisited: {
    backgroundColor: colors.visited,
  },
  tileNotVisited: {
    backgroundColor: colors.background,
  },
  tileFlag: {
    fontSize: 24,
    lineHeight: 32,
  },
  tileName: {
    ...fonts.caption,
    color: colors.textSecondary,
  },
  tileNameVisited: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
