export type MapRestaurant = {
  id: string;
  name: string;
  distance_m: number;
  lat: number;
  lng: number;
  detail_url: string | null;
};

export type RestaurantMapProps = {
  center: {
    latitude: number;
    longitude: number;
  };
  restaurants: MapRestaurant[];
  selectedId?: string | null;
  onSelect?: (restaurant: MapRestaurant) => void;
  fullScreen?: boolean;
};
