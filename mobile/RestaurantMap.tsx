import MapView, { Circle, Marker } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import type { MapRestaurant, RestaurantMapProps } from './RestaurantMap.types';

const SELECTED_SCALE = 1.15;
const MARKER_ANIMATION_MS = 160;

function RestaurantMarker({
  restaurant,
  selected,
  reduceMotion,
  onSelect,
}: {
  restaurant: MapRestaurant;
  selected: boolean;
  reduceMotion: boolean;
  onSelect?: (restaurant: MapRestaurant) => void;
}) {
  const scale = useRef(new Animated.Value(selected ? SELECTED_SCALE : 1)).current;
  const previousSelected = useRef(selected);
  const [tracksViewChanges, setTracksViewChanges] = useState(false);
  const translateY = scale.interpolate({
    inputRange: [1, SELECTED_SCALE],
    outputRange: [0, -3],
  });

  useEffect(() => {
    scale.stopAnimation();
    const target = selected ? SELECTED_SCALE : 1;
    const selectionChanged = previousSelected.current !== selected;
    previousSelected.current = selected;
    if (reduceMotion || !selectionChanged) {
      scale.setValue(target);
      setTracksViewChanges(false);
      return;
    }

    setTracksViewChanges(true);
    const animation = Animated.timing(scale, {
      toValue: target,
      duration: MARKER_ANIMATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) setTracksViewChanges(false);
    });
    return () => animation.stop();
  }, [reduceMotion, scale, selected]);

  return (
    <Marker
      anchor={{ x: 0.5, y: 1 }}
      centerOffset={{ x: 0, y: -22 }}
      coordinate={{ latitude: restaurant.lat, longitude: restaurant.lng }}
      description={`${restaurant.distance_m.toLocaleString()}m`}
      onPress={() => onSelect?.(restaurant)}
      title={restaurant.name}
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 2 : 1}
    >
      <View pointerEvents="none" style={styles.markerFrame}>
        <Animated.View style={[styles.markerVisual, { transform: [{ translateY }, { scale }] }]}>
          <View style={[styles.markerHead, selected && styles.markerHeadSelected]}>
            <View style={styles.markerDot} />
          </View>
          <View style={[styles.markerTip, selected && styles.markerTipSelected]} />
        </Animated.View>
      </View>
    </Marker>
  );
}

export default function RestaurantMap({ center, restaurants, selectedId, onSelect, fullScreen = false }: RestaurantMapProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

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
        {restaurants.map(restaurant => {
          const selected = restaurant.id === selectedId;
          return (
            <RestaurantMarker
              key={restaurant.id}
              onSelect={onSelect}
              reduceMotion={reduceMotion}
              restaurant={restaurant}
              selected={selected}
            />
          );
        })}
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
  markerFrame: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  markerVisual: {
    alignItems: 'center',
  },
  markerHead: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 14,
    backgroundColor: '#d94b35',
    elevation: 4,
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  markerHeadSelected: {
    backgroundColor: '#212121',
  },
  markerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  markerTip: {
    width: 0,
    height: 0,
    marginTop: -2,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#d94b35',
  },
  markerTipSelected: {
    borderTopColor: '#212121',
  },
});
