// 地図からお店を探す画面です（Figma の「地図からお店を探す」）。
// 地図の上にお店のピンを置き、ピンを押すと下のシートにそのお店を表示します。
// 店名を押すと、予約サイトを外部ブラウザで開きます。
//
// ※ 地図は見た目だけの仮実装です。あとで地図ライブラリ（react-native-maps など）に置き換え、
//    ピンの位置を Shop.position から緯度・経度に変えます。

import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CardImage } from '../components/CardImage';
import { Header } from '../components/Header';
import { CloseIcon, ExternalLinkIcon, PinIcon } from '../components/Icons';
import { colors, fonts, radius, spacing } from '../constants/theme';
import { findCountry, getShops } from '../data/api';
import type { Shop } from '../data/types';

const PIN_WIDTH = 28;
const PIN_HEIGHT = 34;

export function ShopMapScreen() {
  const { countryCode } = useLocalSearchParams<{ countryCode: string }>();
  const country = findCountry(countryCode);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!country) return;
    let active = true;
    getShops(country.code).then(result => {
      if (!active) return;
      setShops(result);
      // 最初は1件目のお店を表示します
      setSelectedId(result[0]?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [country]);

  if (!country) {
    return (
      <View style={styles.screen}>
        <Header title="お店を探す" showBack />
        <Text style={styles.notFound}>国が見つかりませんでした</Text>
      </View>
    );
  }

  const selected = shops.find(shop => shop.id === selectedId);

  return (
    <View style={styles.screen}>
      <Header title={`${country.cuisineName}のお店`} showBack />

      <View style={styles.map} onLayout={event => setMapSize(event.nativeEvent.layout)}>
        <Text style={styles.mapNote}>地図（仮）：ピンを押すとお店が表示されます</Text>
        {mapSize.width > 0 &&
          shops.map(shop => (
            <Pressable
              key={shop.id}
              accessibilityRole="button"
              accessibilityLabel={`${shop.name}のピン`}
              hitSlop={spacing.sm}
              onPress={() => setSelectedId(shop.id)}
              style={[
                styles.pin,
                {
                  left: shop.position.x * mapSize.width - PIN_WIDTH / 2,
                  top: shop.position.y * mapSize.height - PIN_HEIGHT,
                },
                shop.id === selectedId && styles.pinSelected,
              ]}
            >
              <PinIcon color={colors.primary} size={PIN_WIDTH} />
            </Pressable>
          ))}

        {selected && (
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{country.cuisineName}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="閉じる"
                hitSlop={spacing.sm}
                onPress={() => setSelectedId(null)}
              >
                <CloseIcon color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.shop}>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${selected.name}の予約サイトを開く`}
                onPress={() => Linking.openURL(selected.reservationUrl)}
                style={({ pressed }) => [styles.shopLink, pressed && styles.pressed]}
              >
                <Text style={styles.shopName}>{selected.name}</Text>
                <ExternalLinkIcon color={colors.textSecondary} />
              </Pressable>
              <View style={styles.photos}>
                {selected.photoUrls.map((url, index) => (
                  <CardImage key={`${url}-${index}`} imageUrl={url} style={styles.photo} />
                ))}
              </View>
              <Text style={styles.shopInfo}>
                {selected.access}・{selected.budget}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  map: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.imagePlaceholder,
  },
  mapNote: {
    ...fonts.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  pin: {
    position: 'absolute',
  },
  pinSelected: {
    transform: [{ scale: 1.25 }],
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background,
    // 上向きの影（Figma: 0 -4 16 rgba(0,0,0,0.12)）
    boxShadow: '0px -4px 16px rgba(0, 0, 0, 0.12)',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    ...fonts.sheetTitle,
    color: colors.text,
  },
  shop: {
    gap: spacing.sm,
  },
  shopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  shopName: {
    ...fonts.cardTitle,
    color: colors.text,
  },
  pressed: {
    opacity: 0.6,
  },
  photos: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photo: {
    flex: 1,
    height: 72,
    borderRadius: radius.md,
  },
  shopInfo: {
    ...fonts.caption,
    color: colors.textSecondary,
  },
});
