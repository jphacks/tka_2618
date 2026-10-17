// 画面がデータを受け取る「窓口」です。
// 今はダミーデータを返しています。APIができたら、この関数の中身だけを
// fetch に書き換えれば、画面側のコードは変えずにすみます。
//
// 書き換えの例:
//   const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/home`);
//   return (await response.json()) as HomeData;

import { dummyCountries, dummyFeatured, dummyVisitedShops } from './dummy';
import type { Country, HomeData } from './types';

export async function getHomeData(): Promise<HomeData> {
  return {
    featured: dummyFeatured,
    countries: dummyCountries,
    visitedShops: dummyVisitedShops,
  };
}

// 国のIDから国の情報（国名・国旗）を探します。
export function findCountry(countries: Country[], countryId: string): Country | undefined {
  return countries.find(country => country.id === countryId);
}
