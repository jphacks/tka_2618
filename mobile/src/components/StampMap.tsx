import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { MapShape } from '../data/mapShapes';

type Props = {
  shapes: MapShape[];
  viewBox: string;
  visitCounts: ReadonlyMap<string, number>;
  selectedCode: string | null;
  onSelect: (shape: MapShape) => void;
};

export function StampMap({ shapes, viewBox, visitCounts, selectedCode, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const mapWidth = Math.min(width - 48, 752);
  const values = viewBox.split(' ').map(Number);
  const aspectRatio = values.length === 4 && values[3] > 0 ? values[2] / values[3] : 1.5;

  return (
    <View style={[styles.frame, { width: mapWidth, height: mapWidth / aspectRatio }]}>
      <Svg accessibilityLabel="訪問した地域を塗ったスタンプ地図" width="100%" height="100%" viewBox={viewBox}>
        {shapes.map(shape => {
          const visited = (visitCounts.get(shape.code) ?? 0) > 0;
          const selected = selectedCode === shape.code;
          return (
            <Path
              key={shape.code}
              d={shape.path}
              fill={visited ? '#111111' : '#ffffff'}
              stroke={selected ? '#1c8b59' : '#929b98'}
              strokeWidth={selected ? 2.6 : 0.8}
              onPress={() => onSelect(shape)}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', backgroundColor: '#f6f7f6', borderRadius: 16, padding: 8, overflow: 'hidden' },
});
