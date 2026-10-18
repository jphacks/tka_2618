import type { KeyboardEvent } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { calculateStampMapSize, type StampMapProps } from './StampMap.types';

export function StampMap({ shapes, viewBox, visitCounts, selectedCode, onSelect }: StampMapProps) {
  const { width } = useWindowDimensions();
  const mapSize = calculateStampMapSize(width, viewBox);

  const selectWithKeyboard = (event: KeyboardEvent<SVGPathElement>, shape: StampMapProps['shapes'][number]) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect(shape);
  };

  return (
    <View style={[styles.frame, mapSize]}>
      <svg
        aria-label="訪問した地域を塗ったスタンプ地図"
        role="group"
        viewBox={viewBox}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        {shapes.map(shape => {
          const visited = (visitCounts.get(shape.code) ?? 0) > 0;
          const selected = selectedCode === shape.code;
          return (
            <path
              aria-label={shape.name}
              role="button"
              tabIndex={0}
              key={shape.code}
              d={shape.path}
              fill={visited ? '#111111' : '#ffffff'}
              stroke={selected ? '#c69214' : '#929b98'}
              strokeWidth={selected ? 3 : 0.8}
              onClick={() => onSelect(shape)}
              onKeyDown={event => selectWithKeyboard(event, shape)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', backgroundColor: '#f2f2f0', borderRadius: 16, padding: 8, overflow: 'hidden' },
});
