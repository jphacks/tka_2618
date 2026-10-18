import MapView, { Circle, Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

import type { RestaurantMapProps } from './RestaurantMap.types';

export default function RestaurantMap({ center, restaurants, selectedId, onSelect, fullScreen = false }: RestaurantMapProps) {
  return (
    <View style={[styles.frame, fullScreen && styles.fullScreen]}>
      <MapView
        initialRegion={{
          ...center,
          latitudeDelta: 0.065,
          longitudeDelta: 0.065,
        }}
        showsUserLocation
        style={styles.map}
      >
        <Circle
          center={center}
          fillColor="rgba(33, 90, 73, 0.10)"
          radius={3000}
          strokeColor="rgba(33, 90, 73, 0.75)"
          strokeWidth={2}
        />
        {restaurants.map(restaurant => (
          <Marker
            coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
            description={`${restaurant.distance_m.toLocaleString()}m`}
            key={restaurant.id}
            onPress={() => onSelect?.(restaurant)}
            pinColor={restaurant.id === selectedId ? '#212121' : '#d94b35'}
            title={restaurant.name}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 14,
    height: 360,
    overflow: 'hidden',
  },
  fullScreen: {
    flex: 1,
    height: undefined,
    borderRadius: 0,
  },
  map: {
    height: '100%',
    width: '100%',
  },
});
