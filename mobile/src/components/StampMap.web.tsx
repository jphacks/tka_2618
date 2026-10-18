import { useEffect, useMemo, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { STAMP_MAP_ZOOM_IN, STAMP_MAP_ZOOM_OUT, StampMapControls, useStampMapCamera } from './StampMapControls';
import { calculateStampMapSize, cameraToViewBox, panCamera, zoomCamera, type StampMapProps } from './StampMap.types';

const DRAG_THRESHOLD = 4;
const WHEEL_ZOOM_SENSITIVITY = 0.002;

export function StampMap({ shapes, viewBox, visitCounts, selectedCode, onSelect }: StampMapProps) {
  const { width } = useWindowDimensions();
  const mapSize = calculateStampMapSize(width);
  const { camera, updateCamera, zoom, zoomBy, reset } = useStampMapCamera(viewBox, mapSize.width, mapSize.height);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef({ pointerId: -1, x: 0, y: 0, distance: 0 });
  // ドラッグ直後のclickで地域が選択されないよう、移動量が閾値を超えたら1回だけ選択を無視する。
  const suppressClick = useRef(false);

  // ReactのonWheelはpassiveでページスクロールを止められないため、DOMへ直接登録する。
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);
      const focalX = (event.clientX - rect.left) / rect.width;
      const focalY = (event.clientY - rect.top) / rect.height;
      updateCamera((current, base) => zoomCamera(current, base, factor, focalX, focalY));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [updateCamera]);

  const startDrag = (event: PointerEvent<SVGSVGElement>) => {
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, distance: 0 };
    suppressClick.current = false;
  };

  const moveDrag = (event: PointerEvent<SVGSVGElement>) => {
    const current = drag.current;
    if (current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    current.distance += Math.hypot(dx, dy);
    if (current.distance < DRAG_THRESHOLD) return;
    if (!suppressClick.current) event.currentTarget.setPointerCapture(event.pointerId);
    suppressClick.current = true;
    updateCamera((camera, base) => panCamera(camera, base, dx / mapSize.width, dy / mapSize.height));
    drag.current = { ...current, x: event.clientX, y: event.clientY };
  };

  const endDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (drag.current.pointerId === event.pointerId) drag.current.pointerId = -1;
  };

  // ドラッグを終えたときのclickは、地域へ届く前のキャプチャ段階で止める。
  const blockClickAfterDrag = (event: MouseEvent<SVGSVGElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.stopPropagation();
  };

  const paths = useMemo(() => {
    const selectWithKeyboard = (event: KeyboardEvent<SVGPathElement>, shape: StampMapProps['shapes'][number]) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onSelect(shape);
    };
    return shapes.map(shape => {
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
          strokeWidth={selected ? 2.5 : 0.6}
          vectorEffect="non-scaling-stroke"
          onClick={() => onSelect(shape)}
          onKeyDown={event => selectWithKeyboard(event, shape)}
          style={{ cursor: 'pointer' }}
        />
      );
    });
  }, [shapes, visitCounts, selectedCode, onSelect]);

  return (
    <View style={[styles.frame, mapSize]}>
      <svg
        ref={svgRef}
        aria-label="訪問した地域を塗ったスタンプ地図"
        role="group"
        viewBox={cameraToViewBox(camera)}
        width="100%"
        height="100%"
        style={{ display: 'block', cursor: zoom > 1.01 ? 'grab' : 'default' }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={blockClickAfterDrag}
      >
        {paths}
      </svg>
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
