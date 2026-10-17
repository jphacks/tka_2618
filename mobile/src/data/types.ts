// アプリで扱うデータの「形」です。
// APIから受け取るデータも、この形に合わせて使います。

// バックエンドが対応している12か国の国コード（backend の cuisines.json と同じ）
export type CountryCode = 'JP' | 'KR' | 'CN' | 'TH' | 'VN' | 'IN' | 'IT' | 'FR' | 'ES' | 'MX' | 'TR' | 'US';

export type Country = {
  code: CountryCode;
  name: string; // 例: 'タイ'
  cuisineName: string; // 例: 'タイ料理'
  flag: string; // 国旗の絵文字（例: 🇹🇭）
  imageUrl?: string; // 料理の写真。なければ灰色の仮表示
};

export type FeaturedCountry = {
  id: string;
  countryCode: CountryCode;
  title: string;
  description: string;
  imageUrl?: string;
};

// 今まで訪れたお店（写真を記録したお店）
export type VisitedShop = {
  id: string;
  name: string;
  countryCode: CountryCode;
  visitedAt: string; // 例: '2026-10-01'
  imageUrl?: string;
  memo?: string;
};

// 地図に表示するお店
export type Shop = {
  id: string;
  name: string;
  countryCode: CountryCode;
  access: string; // 例: '新宿駅 徒歩3分'
  budget: string; // 例: 'ディナー 2,000〜3,000円'
  photoUrls: string[];
  reservationUrl: string; // 予約サイトのURL
  // 仮の地図の上での位置（左上が 0、右下が 1）。本物の地図では緯度・経度に置き換えます
  position: { x: number; y: number };
};

// 予約したお店
export type Reservation = {
  id: string;
  countryCode: CountryCode;
  shopName: string;
  dateTime: string; // 例: '2026-10-18T19:00'
  info?: string; // 例: '新宿駅 徒歩3分・ディナー 2,000〜3,000円'
  imageUrl?: string;
  notify: boolean; // 予約時間に通知するか
};

export type HomeData = {
  featured: FeaturedCountry[];
  countries: Country[];
  visitedShops: VisitedShop[];
};
