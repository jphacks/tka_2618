import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { calculateStampMapSize, type StampMapProps } from './StampMap.types';

export function StampMap({ shapes, viewBox, visitCounts, selectedCode, onSelect }: StampMapProps) {
  const { width } = useWindowDimensions();
  const mapSize = calculateStampMapSize(width, viewBox);

  return (
    <View style={[styles.frame, mapSize]}>
      <Svg accessibilityLabel="訪問した地域を塗ったスタンプ地図" width="100%" height="100%" viewBox={viewBox}>
        {shapes.map(shape => {
          const visited = (visitCounts.get(shape.code) ?? 0) > 0;
          const selected = selectedCode === shape.code;
          return (
            <Path
              key={shape.code}
              d={shape.path}
              fill={visited ? '#111111' : '#ffffff'}
              stroke={selected ? '#c69214' : '#929b98'}
              strokeWidth={selected ? 3 : 0.8}
              onPress={() => onSelect(shape)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', backgroundColor: '#f2f2f0', borderRadius: 16, padding: 8, overflow: 'hidden' },
});
