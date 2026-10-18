import { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import { STAMP_MAP_ZOOM_IN, STAMP_MAP_ZOOM_OUT, StampMapControls, useStampMapCamera } from './StampMapControls';
import { calculateStampMapSize, cameraToViewBox, panCamera, zoomCamera, type StampMapProps } from './StampMap.types';

export function StampMap({ shapes, viewBox, visitCounts, selectedCode, onSelect }: StampMapProps) {
  const { width } = useWindowDimensions();
  const mapSize = calculateStampMapSize(width);
  const { camera, updateCamera, zoom, zoomBy, reset } = useStampMapCamera(viewBox, mapSize.width, mapSize.height);

  // onChange は前回イベントからの差分を渡すため、ピンチとドラッグを同時に扱える。
  const pinch = Gesture.Pinch()
    .runOnJS(true)
    .onChange(event => updateCamera((current, base) => zoomCamera(
      current,
      base,
      event.scaleChange,
      event.focalX / mapSize.width,
      event.focalY / mapSize.height,
    )));

  // 全体表示のときはドラッグを無効にし、画面の縦スクロールを妨げない。
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(zoom > 1.01)
    .maxPointers(1)
    .minDistance(8)
    .onChange(event => updateCamera((current, base) => panCamera(
      current,
      base,
      event.changeX / mapSize.width,
      event.changeY / mapSize.height,
    )));

  // 拡大操作では塗り・枠線は変わらないため、パスを作り直さずviewBoxだけを更新する。
  const paths = useMemo(() => shapes.map(shape => {
    const visited = (visitCounts.get(shape.code) ?? 0) > 0;
    const selected = selectedCode === shape.code;
    return (
      <Path
        key={shape.code}
        d={shape.path}
        fill={visited ? '#111111' : '#ffffff'}
        stroke={selected ? '#c69214' : '#929b98'}
        strokeWidth={selected ? 2.5 : 0.6}
        vectorEffect="non-scaling-stroke"
        onPress={() => onSelect(shape)}
      />
    );
  }), [shapes, visitCounts, selectedCode, onSelect]);

  return (
    <View style={[styles.frame, mapSize]}>
      <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
        <View style={StyleSheet.absoluteFill}>
          <Svg accessibilityLabel="訪問した地域を塗ったスタンプ地図" width="100%" height="100%" viewBox={cameraToViewBox(camera)}>
            {paths}
          </Svg>
        </View>
      </GestureDetector>
      <StampMapControls
        zoom={zoom}
        onZoomIn={() => zoomBy(STAMP_MAP_ZOOM_IN)}
        onZoomOut={() => zoomBy(STAMP_MAP_ZOOM_OUT)}
        onReset={reset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', backgroundColor: '#f2f2f0', borderRadius: 16, overflow: 'hidden' },
});
