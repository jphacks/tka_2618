// 画面がデータを受け取る「窓口」です。
// 今はダミーデータを返しています。APIができたら、各関数の中身だけを
// fetch に書き換えれば、画面側のコードは変えずにすみます。
//
// 書き換えの例:
//   const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/home`);
//   return (await response.json()) as HomeData;

import { dummyCountries, dummyFeatured, dummyReservations, dummyShops, dummyVisitedShops } from './dummy';
import type { Country, CountryCode, HomeData, Reservation, Shop } from './types';

export async function getHomeData(): Promise<HomeData> {
  return {
    featured: dummyFeatured,
    countries: dummyCountries,
    visitedShops: dummyVisitedShops,
  };
}

export async function getCountries(): Promise<Country[]> {
  return dummyCountries;
}

// その国の料理のお店（地図に表示する分）
export async function getShops(countryCode: CountryCode): Promise<Shop[]> {
  return dummyShops.filter(shop => shop.countryCode === countryCode);
}

// アプリを開いたときの予約一覧
export async function getReservations(): Promise<Reservation[]> {
  return dummyReservations;
}

// 国コードから国の情報（国名・国旗）を探します。
export function findCountry(countryCode: string | undefined): Country | undefined {
  return dummyCountries.find(country => country.code === countryCode);
}
