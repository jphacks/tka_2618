// スタンプ地図の拡大・縮小ボタンと、表示範囲（カメラ）の状態をまとめた部品です。
// iOS/Android 版と Web 版の StampMap の両方から使います。

import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  STAMP_MAP_BUTTON_ZOOM_STEP,
  STAMP_MAP_MAX_ZOOM,
  fitCamera,
  zoomCamera,
  zoomLevel,
  type MapCamera,
} from './StampMap.types';

type CameraUpdate = (camera: MapCamera, base: MapCamera) => MapCamera;

export function useStampMapCamera(viewBox: string, frameWidth: number, frameHeight: number) {
  const base = useMemo(() => fitCamera(viewBox, frameWidth, frameHeight), [viewBox, frameWidth, frameHeight]);
  const [state, setState] = useState({ base, camera: base });

  // 地図の種類や枠の大きさが変わったら全体表示に戻す。
  let current = state;
  if (state.base !== base) {
    current = { base, camera: base };
    setState(current);
  }

  // ジェスチャーは連続して届くため、常に最新のカメラを元に計算する。
  const updateCamera = useCallback((update: CameraUpdate) => setState(previous => ({
    base: previous.base,
    camera: update(previous.camera, previous.base),
  })), []);

  return {
    camera: current.camera,
    updateCamera,
    zoom: zoomLevel(current.camera, current.base),
    zoomBy: (factor: number) => updateCamera((camera, cameraBase) => zoomCamera(camera, cameraBase, factor)),
    reset: () => updateCamera((_camera, cameraBase) => cameraBase),
  };
}

type StampMapControlsProps = {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function StampMapControls({ zoom, onZoomIn, onZoomOut, onReset }: StampMapControlsProps) {
  const canZoomIn = zoom < STAMP_MAP_MAX_ZOOM - 0.01;
  const canZoomOut = zoom > 1.01;
  const buttons = [
    { label: '+', accessibilityLabel: '地図を拡大', onPress: onZoomIn, disabled: !canZoomIn },
    { label: '−', accessibilityLabel: '地図を縮小', onPress: onZoomOut, disabled: !canZoomOut },
    { label: '⤢', accessibilityLabel: '地図の表示を元に戻す', onPress: onReset, disabled: !canZoomOut },
  ];

  return (
    <View style={styles.controls}>
      {buttons.map(button => (
        <Pressable
          key={button.accessibilityLabel}
          accessibilityRole="button"
          accessibilityLabel={button.accessibilityLabel}
          accessibilityState={{ disabled: button.disabled }}
          disabled={button.disabled}
          onPress={button.onPress}
          style={[styles.button, button.disabled && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>{button.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export const STAMP_MAP_ZOOM_IN = STAMP_MAP_BUTTON_ZOOM_STEP;
export const STAMP_MAP_ZOOM_OUT = 1 / STAMP_MAP_BUTTON_ZOOM_STEP;

const styles = StyleSheet.create({
  controls: { position: 'absolute', top: 8, right: 8, gap: 6 },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9dedc',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#111111', fontSize: 20, fontWeight: '700', lineHeight: 22 },
});
