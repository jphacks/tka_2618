// ホーム画面がデータを受け取る「窓口」です。
// 国一覧はバックエンドを正として取得し、訪問履歴は端末内の記録を使用します。

import { listVisits } from '../repositories/visitRepository';
import { dummyFeatured } from './dummy';
import { searchApi, type SearchCountry } from './searchApi';
import type { Country, HomeData } from './types';

type CountryListResponse = {
  countries: SearchCountry[];
};

export async function getHomeData(signal: AbortSignal): Promise<HomeData> {
  const [response, visits] = await Promise.all([
    searchApi<CountryListResponse>('/api/countries', signal),
    listVisits().catch(() => []),
  ]);
  return {
    featured: dummyFeatured,
    countries: response.countries
      .filter(country => country.cuisine_supported)
      .map(country => ({
        id: country.code.toLowerCase(),
        name: country.name_ja,
        flag: country.flag,
      })),
    visitedShops: visits.map(visit => ({
      id: visit.id,
      name: visit.shopName,
      countryId: visit.countryCode.toLowerCase(),
      visitedAt: visit.visitedAt.slice(0, 10),
      imageUrl: visit.photoUris[0],
      verificationMode: visit.verification.mode,
    })),
  };
}

// 国のIDから国の情報（国名・国旗）を探します。
export function findCountry(countries: Country[], countryId: string): Country | undefined {
  return countries.find(country => country.id === countryId);
}
