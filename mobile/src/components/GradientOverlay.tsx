// 写真の上に重ねる、透明から暗い色へのグラデーションです。
// 写真の上に白い文字を載せても読めるようにするために使います。

import { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../constants/theme';

type Props = {
  // 上から下へ、位置（0〜1）ごとの暗さ（0=透明、1=真っ黒）
  stops: { offset: number; opacity: number }[];
};

export function GradientOverlay({ stops }: Props) {
  // 画面に複数あっても混ざらないよう、部品ごとに別のIDを付けます
  const id = `shade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  // 重ねる先の大きさを測ってから描きます（どの端末でも同じ見た目にするため）
  const [size, setSize] = useState({ width: 0, height: 0 });

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={event => setSize(event.nativeEvent.layout)}
    >
      {size.width > 0 && (
        <Svg width={size.width} height={size.height}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              {stops.map(stop => (
                <Stop key={stop.offset} offset={stop.offset} stopColor={colors.imageShade} stopOpacity={stop.opacity} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={size.width} height={size.height} fill={`url(#${id})`} />
        </Svg>
      )}
    </View>
  );
}
