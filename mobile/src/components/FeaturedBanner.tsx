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
import { colors, fonts, radius, spacing } from '../constants/theme';
import type { FeaturedCountry } from '../data/types';
import { CardImage } from './CardImage';
import { GradientOverlay } from './GradientOverlay';

type Props = {
  title: string;
  items: FeaturedCountry[];
  onPressItem?: (item: FeaturedCountry) => void;
};

// ステータスバー（時計など）より下の部分の高さ
const CONTENT_HEIGHT = 280;
const DOT_SIZE = 8;

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
            <CardImage imageUrl={item.imageUrl} style={StyleSheet.absoluteFill} />
            {/* 上（時計・見出し）と下（料理の説明）を暗くして、白い文字を読みやすくします */}
            <GradientOverlay
              stops={[
                { offset: 0, opacity: 0.5 },
                { offset: 0.35, opacity: 0 },
                { offset: 0.5, opacity: 0 },
                { offset: 1, opacity: 0.75 },
              ]}
            />
            <View style={styles.caption}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </Pressable>
        )}
      />

      {/* スワイプしても動かない見出し */}
      <Text
        accessibilityRole="header"
        pointerEvents="none"
        style={[styles.title, { top: insets.top + spacing.md }]}
      >
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
    backgroundColor: colors.imagePlaceholder,
  },
  title: {
    ...fonts.bodyBold,
    color: colors.textOnImage,
    position: 'absolute',
    left: spacing.screen,
  },
  caption: {
    position: 'absolute',
    left: spacing.screen,
    right: spacing.screen,
    bottom: spacing.xl + DOT_SIZE,
  },
  itemTitle: {
    ...fonts.bannerTitle,
    color: colors.textOnImage,
  },
  itemDescription: {
    ...fonts.body,
    color: colors.textOnImage,
  },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.dot,
  },
  dotActive: {
    width: DOT_SIZE * 3,
    backgroundColor: colors.dotActive,
  },
});
