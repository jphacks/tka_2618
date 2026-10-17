export type DemoRestaurant = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  prefectureCode: string | null;
  address: string;
  label: string;
};

export const demoRestaurants: DemoRestaurant[] = [
  {
    id: 'demo-italy-tokyo',
    name: 'デモ・トラットリア',
    latitude: 35.681236,
    longitude: 139.767125,
    countryCode: 'IT',
    prefectureCode: null,
    address: '東京都千代田区（デモ店舗）',
    label: '世界地図デモ：イタリア料理店',
  },
  {
    id: 'demo-tokyo-local',
    name: 'デモ・東京郷土料理店',
    latitude: 35.681236,
    longitude: 139.767125,
    countryCode: 'JP',
    prefectureCode: 'JP-13',
    address: '東京都千代田区（デモ店舗）',
    label: '日本地図デモ：東京都の料理店',
  },
];
