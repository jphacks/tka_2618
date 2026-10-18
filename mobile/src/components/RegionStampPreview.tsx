import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { radius } from '../constants/theme';
import type { MapShape } from '../data/mapShapes';
import { calculateMapShapeViewBox } from '../utils/mapPathBounds';

export function RegionStampPreview({ shape, label }: { shape: MapShape; label: string }) {
  return (
    <View style={styles.frame}>
      <Svg accessibilityLabel={`${label}の獲得スタンプ`} width="100%" height="100%" viewBox={calculateMapShapeViewBox(shape.path)}>
        <Path d={shape.path} fill="#111111" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    height: 260,
    padding: 20,
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: '#f2f2f0',
  },
});
