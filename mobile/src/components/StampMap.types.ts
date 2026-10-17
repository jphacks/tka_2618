import type { MapShape } from '../data/mapShapes';

export type StampMapProps = {
  shapes: MapShape[];
  viewBox: string;
  visitCounts: ReadonlyMap<string, number>;
  selectedCode: string | null;
  onSelect: (shape: MapShape) => void;
};

export function calculateStampMapSize(availableWidth: number, viewBox: string) {
  const width = Math.min(availableWidth - 48, 752);
  const values = viewBox.split(' ').map(Number);
  const aspectRatio = values.length === 4 && values[3] > 0 ? values[2] / values[3] : 1.5;
  return { width, height: width / aspectRatio };
}
