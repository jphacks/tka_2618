import { divIcon, latLngBounds } from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './RestaurantMap.web.css';

import type { RestaurantMapProps } from './RestaurantMap.types';

const currentLocationIcon = divIcon({
  className: 'current-location-marker',
  html: '<span aria-label="現在地"></span>',
  iconAnchor: [10, 10],
  iconSize: [20, 20],
});

const restaurantIcon = divIcon({
  className: 'restaurant-location-marker',
  html: '<span aria-hidden="true">●</span>',
  iconAnchor: [13, 26],
  iconSize: [26, 26],
});

const selectedRestaurantIcon = divIcon({
  className: 'selected-restaurant-location-marker',
  html: '<span aria-hidden="true">●</span>',
  iconAnchor: [15, 30],
  iconSize: [30, 30],
});

export default function RestaurantMap({ center, restaurants, selectedId, onSelect }: RestaurantMapProps) {
  const centerPoint: [number, number] = [center.latitude, center.longitude];
  const points: [number, number][] = [
    centerPoint,
    ...restaurants.map(restaurant => [restaurant.lat, restaurant.lng] as [number, number]),
  ];
  const bounds = latLngBounds(points);

  return (
    <div className="restaurant-map-frame">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [36, 36], maxZoom: 14 }}
        className="restaurant-map"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={centerPoint}
          pathOptions={{ color: '#215a49', fillColor: '#215a49', fillOpacity: 0.1 }}
          radius={3000}
        />
        <Marker icon={currentLocationIcon} position={centerPoint}>
          <Popup>現在地</Popup>
        </Marker>
        {restaurants.map(restaurant => (
          <Marker
            eventHandlers={{ click: () => onSelect?.(restaurant) }}
            icon={restaurant.id === selectedId ? selectedRestaurantIcon : restaurantIcon}
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lng]}
          >
            <Popup>
              <strong>{restaurant.name}</strong>
              <br />
              現在地から{restaurant.distance_m.toLocaleString()}m
              {restaurant.detail_url && (
                <>
                  <br />
                  <a href={restaurant.detail_url} rel="noreferrer" target="_blank">店舗詳細を見る</a>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
