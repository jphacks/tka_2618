// 「おすすめの国特集」の、横にスワイプできるバナーです。
// 下のドットで今何枚目かを表示します。画面のいちばん上（時計の裏）まで広がります。

import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../constants/theme';
import type { FeaturedCountry } from '../data/types';
import { CardImage } from './CardImage';

type Props = {
  title: string;
  items: FeaturedCountry[];
  onPressItem?: (item: FeaturedCountry) => void;
};

// ステータスバー（時計など）より下の部分の高さ
const CONTENT_HEIGHT = 228;

export function FeaturedBanner({ title, items, onPressItem }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const height = insets.top + CONTENT_HEIGHT;

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onPressItem?.(item)}
            style={{ width, height }}
          >
            <CardImage
              imageUrl={item.imageUrl}
              style={[StyleSheet.absoluteFill, { backgroundColor: item.backgroundColor }]}
            />
            <View style={styles.caption}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </Pressable>
        )}
      />

      {/* スワイプしても動かない見出し */}
      <Text accessibilityRole="header" pointerEvents="none" style={[styles.title, { top: insets.top + 18 }]}>
        {title}
      </Text>

      <View pointerEvents="none" style={styles.dots}>
        {items.map((item, index) => (
          <View key={item.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bannerBackground,
  },
  title: {
    ...fonts.heading,
    color: colors.textOnDark,
    position: 'absolute',
    left: 35,
  },
  caption: {
    position: 'absolute',
    left: 35,
    right: 35,
    bottom: 36,
    gap: 4,
  },
  itemTitle: {
    ...fonts.heading,
    color: colors.textOnDark,
  },
  itemDescription: {
    ...fonts.body,
    color: colors.textOnDark,
  },
  dots: {
    position: 'absolute',
    bottom: 9,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: radius.full,
    backgroundColor: colors.dot,
  },
  dotActive: {
    backgroundColor: colors.dotActive,
  },
});
