// ホーム画面がデータを受け取る「窓口」です。
// 国一覧はバックエンドを正として取得し、APIがまだない特集と訪問履歴は
// 表示確認用のデータを使用します。

import { dummyFeatured, dummyVisitedShops } from './dummy';
import { searchApi, type SearchCountry } from './searchApi';
import type { Country, HomeData } from './types';

type CountryListResponse = {
  countries: SearchCountry[];
};

export async function getHomeData(signal: AbortSignal): Promise<HomeData> {
  const response = await searchApi<CountryListResponse>('/api/countries', signal);
  return {
    featured: dummyFeatured,
    countries: response.countries
      .filter(country => country.cuisine_supported)
      .map(country => ({
        id: country.code.toLowerCase(),
        name: country.name_ja,
        flag: country.flag,
      })),
    visitedShops: dummyVisitedShops,
  };
}

// 国のIDから国の情報（国名・国旗）を探します。
export function findCountry(countries: Country[], countryId: string): Country | undefined {
  return countries.find(country => country.id === countryId);
}
