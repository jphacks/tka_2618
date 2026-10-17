// 画面下のタブバー（ホーム / 地図 / 予約 / 設定）です。
// 並ぶタブは src/constants/tabs.ts で決めています。
// 選ばれているタブは黒の太字、それ以外は薄く表示します。

import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing, tabInactiveOpacity } from '../constants/theme';
import { tabs } from '../constants/tabs';

export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const tab = tabs.find(item => item.name === route.name);
        if (!tab) return null;

        const focused = state.index === index;

        const onPress = () => {
          // 選択中のタブをもう一度押したときは、そのタブの最初の画面に戻ります
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={onPress}
            style={[styles.tab, !focused && styles.inactive]}
          >
            <tab.Icon color={colors.text} />
            <Text style={[focused ? fonts.tabLabelActive : fonts.tabLabel, styles.label]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  inactive: {
    opacity: tabInactiveOpacity,
  },
  label: {
    color: colors.text,
    marginTop: 2,
  },
});
