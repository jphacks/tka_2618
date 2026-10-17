// ホーム画面がデータを受け取る「窓口」です。
// 国一覧はバックエンドを正として取得し、訪問履歴は端末内の記録を使用します。

import { listVisits } from '../repositories/visitRepository';
import { getCachedCountries, saveCountries } from '../repositories/locationCatalogRepository';
import { dummyFeatured } from './dummy';
import { searchApi, type SearchCountry } from './searchApi';
import type { VisitRecord } from './visitTypes';
import type { Country, HomeData, VisitedShop } from './types';

type CountryListResponse = {
  countries: SearchCountry[];
};

function mapCountries(countries: SearchCountry[]): Country[] {
  return countries
    .filter(country => country.cuisine_supported)
    .map(country => ({
      id: country.code.toLowerCase(),
      name: country.name_ja,
      flag: country.flag,
    }));
}

function mapVisits(visits: VisitRecord[]): VisitedShop[] {
  return visits.map(visit => ({
    id: visit.id,
    name: visit.shopName,
    countryId: visit.countryCode.toLowerCase(),
    visitedAt: visit.visitedAt.slice(0, 10),
    imageUrl: visit.photoUris[0],
    verificationMode: visit.verification.mode,
  }));
}

function createHomeData(countries: SearchCountry[], visits: VisitRecord[]): HomeData {
  return {
    featured: dummyFeatured,
    countries: mapCountries(countries),
    visitedShops: mapVisits(visits),
  };
}

export async function getFreshHomeData(signal: AbortSignal): Promise<HomeData> {
  const [response, visits] = await Promise.all([
    searchApi<CountryListResponse>('/api/countries', signal),
    listVisits().catch(() => []),
  ]);
  await saveCountries(response.countries).catch(() => undefined);
  return createHomeData(response.countries, visits);
}

export async function getCachedHomeData(): Promise<HomeData | null> {
  const countries = await getCachedCountries();
  if (!countries) return null;
  const visits = await listVisits().catch(() => []);
  return createHomeData(countries, visits);
}

// 国のIDから国の情報（国名・国旗）を探します。
export function findCountry(countries: Country[], countryId: string): Country | undefined {
  return countries.find(country => country.id === countryId);
}
