import type { MapShape } from '../data/mapShapes';

export type StampMapProps = {
  shapes: MapShape[];
  viewBox: string;
  visitCounts: ReadonlyMap<string, number>;
  selectedCode: string | null;
  onSelect: (shape: MapShape) => void;
};

/** SVG座標系で表した、いま地図枠に映している範囲です。 */
export type MapCamera = { x: number; y: number; width: number; height: number };

export const STAMP_MAP_MAX_ZOOM = 8;
export const STAMP_MAP_BUTTON_ZOOM_STEP = 1.5;
const FRAME_MAX_WIDTH = 768;
const FRAME_MAX_HEIGHT = 520;
const FRAME_GUTTER = 32;

export function calculateStampMapSize(availableWidth: number) {
  const width = Math.min(availableWidth - FRAME_GUTTER, FRAME_MAX_WIDTH);
  return { width, height: Math.min(width, FRAME_MAX_HEIGHT) };
}

/** 地図全体が枠の中央に収まるよう、枠の縦横比に合わせて広げた初期カメラを返します。 */
export function fitCamera(viewBox: string, frameWidth: number, frameHeight: number): MapCamera {
  const values = viewBox.split(' ').map(Number);
  const [x, y, width, height] = values.length === 4 && values[2] > 0 && values[3] > 0 ? values : [0, 0, 1.5, 1];
  const frameAspect = frameWidth / frameHeight;
  if (width / height > frameAspect) {
    const fittedHeight = width / frameAspect;
    return { x, y: y - (fittedHeight - height) / 2, width, height: fittedHeight };
  }
  const fittedWidth = height * frameAspect;
  return { x: x - (fittedWidth - width) / 2, y, width: fittedWidth, height };
}

export function cameraToViewBox(camera: MapCamera) {
  return `${camera.x} ${camera.y} ${camera.width} ${camera.height}`;
}

export function zoomLevel(camera: MapCamera, base: MapCamera) {
  return base.width / camera.width;
}

/** 倍率を1〜最大倍率に、表示範囲を地図全体の内側に収めます。 */
export function clampCamera(camera: MapCamera, base: MapCamera): MapCamera {
  const width = Math.min(base.width, Math.max(base.width / STAMP_MAP_MAX_ZOOM, camera.width));
  const height = width * (base.height / base.width);
  return {
    x: Math.min(base.x + base.width - width, Math.max(base.x, camera.x)),
    y: Math.min(base.y + base.height - height, Math.max(base.y, camera.y)),
    width,
    height,
  };
}

/** 枠内の位置 (focalX, focalY: 0〜1) を固定したまま factor 倍に拡大します。 */
export function zoomCamera(camera: MapCamera, base: MapCamera, factor: number, focalX = 0.5, focalY = 0.5) {
  const width = camera.width / factor;
  const height = camera.height / factor;
  return clampCamera({
    x: camera.x + (camera.width - width) * focalX,
    y: camera.y + (camera.height - height) * focalY,
    width,
    height,
  }, base);
}

/** 枠の幅・高さに対する割合 (dx, dy) だけ指の動きに合わせて地図を動かします。 */
export function panCamera(camera: MapCamera, base: MapCamera, dx: number, dy: number) {
  return clampCamera({ ...camera, x: camera.x - dx * camera.width, y: camera.y - dy * camera.height }, base);
}
