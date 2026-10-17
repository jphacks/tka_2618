// 仮のダミーデータです。表示を確認するためだけに使います。
// APIができたら、このファイルは使わなくなります（src/data/api.ts を参照）。

import type { Country, FeaturedCountry, VisitedShop } from './types';

export const dummyCountries: Country[] = [
  { id: 'br', name: 'ブラジル', flag: '🇧🇷' },
  { id: 'th', name: 'タイ', flag: '🇹🇭' },
  { id: 'it', name: 'イタリア', flag: '🇮🇹' },
  { id: 'mx', name: 'メキシコ', flag: '🇲🇽' },
  { id: 'in', name: 'インド', flag: '🇮🇳' },
  { id: 'vn', name: 'ベトナム', flag: '🇻🇳' },
];

export const dummyFeatured: FeaturedCountry[] = [
  { id: 'f1', countryId: 'th', title: 'タイ料理特集', description: 'ガパオ・トムヤムクンを食べに行こう', backgroundColor: '#787878' },
  { id: 'f2', countryId: 'it', title: 'イタリア料理特集', description: '本場のピッツァが食べられるお店', backgroundColor: '#6B6B6B' },
  { id: 'f3', countryId: 'mx', title: 'メキシコ料理特集', description: 'タコスで手軽に海外旅行気分', backgroundColor: '#5E5E5E' },
  { id: 'f4', countryId: 'in', title: 'インド料理特集', description: 'スパイスカレーの名店めぐり', backgroundColor: '#858585' },
];

export const dummyVisitedShops: VisitedShop[] = [
  { id: 's1', name: 'シュラスコ・サンパウロ', countryId: 'br', visitedAt: '2026-10-01' },
  { id: 's2', name: 'バーンタイ食堂', countryId: 'th', visitedAt: '2026-09-24' },
  { id: 's3', name: 'トラットリア・ローマ', countryId: 'it', visitedAt: '2026-09-15' },
  { id: 's4', name: 'タケリア・ソル', countryId: 'mx', visitedAt: '2026-09-02' },
];
