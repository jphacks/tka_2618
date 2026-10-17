// 仮のダミーデータです。表示を確認するためだけに使います。
// APIができたら、このファイルは使わなくなります（src/data/api.ts を参照）。

import type { Country, FeaturedCountry, VisitedShop } from './types';

// ---------------------------------------------------------------
// 仮の写真と、その出典
// すべて Unsplash（https://unsplash.com）の写真で、Unsplash License
// （商用利用OK・クレジット表記は不要）で使えます。
// https://unsplash.com/license
// ---------------------------------------------------------------

type Photo = {
  url: string;
  photographer: string;
  source: string; // 写真のページ（どこから持ってきたか）
};

// Unsplash の写真IDから、表示用の画像URLを作ります（w は画像の幅）
function unsplash(photoId: string, width = 800) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

export const dummyPhotos = {
  churrascoGrill: {
    url: unsplash('1558030137-a56c1b004fa3'),
    photographer: 'Emerson Vieira',
    source: 'https://unsplash.com/photos/meat-on-grill-RO6Ke69Szhg',
  },
  churrascoBbq: {
    url: unsplash('1558030089-02acba3c214e'),
    photographer: 'Emerson Vieira',
    source: 'https://unsplash.com/photos/person-barbecuing-meat-_aR4l6fj6wQ',
  },
  padThaiPlate: {
    url: unsplash('1637806930600-37fa8892069d'),
    photographer: 'John Aledia',
    source: 'https://unsplash.com/photos/a-plate-of-food-on-a-wooden-table-_wBJ0cvKhIE',
  },
  padThaiMenu: {
    url: unsplash('1568146245105-20879729354e', 1200),
    photographer: 'Raphael Bernhart',
    source: 'https://unsplash.com/photos/sE4UdOjoYr4',
  },
  pizzaPompei: {
    url: unsplash('1664309641932-0e03e0771b97', 1200),
    photographer: 'Luigi Boccardo',
    source: 'https://unsplash.com/photos/a-pizza-with-cheese-and-basil-wgq8NVyXsYY',
  },
  pizzaMargherita: {
    url: unsplash('1649688423692-308d2fc1027d'),
    photographer: 'Roberto Vincenzo Minasi',
    source: 'https://unsplash.com/photos/a-pizza-with-mozzarella-and-basil-on-a-plate-L4W1uX1xwlQ',
  },
  pizzaSlice: {
    url: unsplash('1449785227466-10687c63e194'),
    photographer: 'Thomas Schweighofer',
    source: 'https://unsplash.com/photos/person-about-to-slice-pizza-on-white-plate-p7Q36vPBFs8',
  },
  tacosBeef: {
    url: unsplash('1599974579688-8dbdd335c77f'),
    photographer: 'Jeswin Thomas',
    source: 'https://unsplash.com/photos/beef-tacos-with-onion-and-cilantro-z_PfaGzeN9E',
  },
  tacosLime: {
    url: unsplash('1648437595587-e6a8b0cdf1f9', 1200),
    photographer: 'Frankie Lopez',
    source: 'https://unsplash.com/photos/a-wooden-plate-topped-with-three-tacos-and-a-lime-_j4S4V2C8ew',
  },
  chickenCurry: {
    url: unsplash('1742599361539-f096753d1100', 1200),
    photographer: 'Imad 786',
    source: 'https://unsplash.com/photos/delicious-indian-chicken-curry-and-rice-ready-to-eat-gwUA_pHaOYY',
  },
  phoBo: {
    url: unsplash('1631709497146-a239ef373cf1'),
    photographer: 'Kirill Tonkikh',
    source: 'https://unsplash.com/photos/a-bowl-of-noodle-soup-with-chopsticks-on-the-side-NFQi_2HUNRI',
  },
} satisfies Record<string, Photo>;

// ---------------------------------------------------------------
// 画面に表示するデータ
// ---------------------------------------------------------------

export const dummyCountries: Country[] = [
  { id: 'br', name: 'ブラジル', flag: '🇧🇷', imageUrl: dummyPhotos.churrascoGrill.url },
  { id: 'th', name: 'タイ', flag: '🇹🇭', imageUrl: dummyPhotos.padThaiPlate.url },
  { id: 'it', name: 'イタリア', flag: '🇮🇹', imageUrl: dummyPhotos.pizzaMargherita.url },
  { id: 'mx', name: 'メキシコ', flag: '🇲🇽', imageUrl: dummyPhotos.tacosBeef.url },
  { id: 'in', name: 'インド', flag: '🇮🇳', imageUrl: dummyPhotos.chickenCurry.url },
  { id: 'vn', name: 'ベトナム', flag: '🇻🇳', imageUrl: dummyPhotos.phoBo.url },
];

export const dummyFeatured: FeaturedCountry[] = [
  { id: 'f1', countryId: 'th', title: 'タイ料理特集', description: 'パッタイ・トムヤムクンを食べに行こう', imageUrl: dummyPhotos.padThaiMenu.url },
  { id: 'f2', countryId: 'it', title: 'イタリア料理特集', description: '本場のピッツァが食べられるお店', imageUrl: dummyPhotos.pizzaPompei.url },
  { id: 'f3', countryId: 'mx', title: 'メキシコ料理特集', description: 'タコスで手軽に海外旅行気分', imageUrl: dummyPhotos.tacosLime.url },
  { id: 'f4', countryId: 'in', title: 'インド料理特集', description: 'スパイスカレーの名店めぐり', imageUrl: dummyPhotos.chickenCurry.url },
];

export const dummyVisitedShops: VisitedShop[] = [
  { id: 's1', name: 'シュラスコ・サンパウロ', countryId: 'br', visitedAt: '2026-10-01', imageUrl: dummyPhotos.churrascoBbq.url },
  { id: 's2', name: 'バーンタイ食堂', countryId: 'th', visitedAt: '2026-09-24', imageUrl: dummyPhotos.padThaiMenu.url },
  { id: 's3', name: 'トラットリア・ローマ', countryId: 'it', visitedAt: '2026-09-15', imageUrl: dummyPhotos.pizzaSlice.url },
  { id: 's4', name: 'タケリア・ソル', countryId: 'mx', visitedAt: '2026-09-02', imageUrl: dummyPhotos.tacosBeef.url },
];
