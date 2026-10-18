import worldMap from '@svg-maps/world';

export type MapShape = {
  code: string;
  name: string;
  path: string;
};

export const worldMapViewBox = worldMap.viewBox;

export const worldMapShapes: MapShape[] = worldMap.locations.map(location => ({
  code: location.id.toUpperCase(),
  name: location.name,
  path: location.path,
}));

export const japanMapViewBox = '0 0 2000 2000';
