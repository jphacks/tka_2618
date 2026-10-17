// 仮のダミーデータです。表示を確認するためだけに使います。
// APIができたら、このファイルは使わなくなります（src/data/api.ts を参照）。

import type { Country, CountryCode, FeaturedCountry, Reservation, Shop, VisitedShop } from './types';

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
  sushi: {
    url: unsplash('1570780775848-bc1897788ce0'),
    photographer: 'Marta Filipczyk',
    source: 'https://unsplash.com/photos/sushi-on-plate-7BQC4h7wd9Y',
  },
  bibimbap: {
    url: unsplash('1741295017668-c8132acd6fc0'),
    photographer: 'Dmitry Pavlovsky',
    source: 'https://unsplash.com/photos/SbHulgzS_eo',
  },
  xiaoLongBao: {
    url: unsplash('1762418967889-10abec43c325'),
    photographer: 'Amos K',
    source: 'https://unsplash.com/photos/steamed-dumplings-served-in-a-bamboo-steamer-basket-idUSfFfqLmw',
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
  phoBo: {
    url: unsplash('1631709497146-a239ef373cf1'),
    photographer: 'Kirill Tonkikh',
    source: 'https://unsplash.com/photos/a-bowl-of-noodle-soup-with-chopsticks-on-the-side-NFQi_2HUNRI',
  },
  chickenCurry: {
    url: unsplash('1742599361539-f096753d1100', 1200),
    photographer: 'Imad 786',
    source: 'https://unsplash.com/photos/delicious-indian-chicken-curry-and-rice-ready-to-eat-gwUA_pHaOYY',
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
  croissant: {
    url: unsplash('1679449223735-444c4f71f0dd'),
    photographer: 'Juliana Barquero',
    source: 'https://unsplash.com/photos/a-croissant-sitting-on-a-plate-on-a-table-UQQN7WJQg6M',
  },
  paella: {
    url: unsplash('1602755088318-39b7a7e6482a'),
    photographer: 'Armando Brenlha',
    source: 'https://unsplash.com/photos/cooked-food-on-black-plate-EufUgeuCa7Y',
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
  lahmacun: {
    url: unsplash('1741166985167-14b7178f15b7'),
    photographer: 'Markus Winkler',
    source: 'https://unsplash.com/photos/delicious-looking-turkish-lahmacun-ready-to-be-served-CAmLnpQXcIY',
  },
  burger: {
    url: unsplash('1515467410840-96a3cf21dbea'),
    photographer: 'Taylor Harding',
    source: 'https://unsplash.com/photos/burger-with-fries-WIkkaFBYQ08',
  },
} satisfies Record<string, Photo>;

// ---------------------------------------------------------------
// 国（バックエンドが対応している12か国）
// ---------------------------------------------------------------

export const dummyCountries: Country[] = [
  { code: 'JP', name: '日本', cuisineName: '日本料理', flag: '🇯🇵', imageUrl: dummyPhotos.sushi.url },
  { code: 'KR', name: '韓国', cuisineName: '韓国料理', flag: '🇰🇷', imageUrl: dummyPhotos.bibimbap.url },
  { code: 'CN', name: '中国', cuisineName: '中国料理', flag: '🇨🇳', imageUrl: dummyPhotos.xiaoLongBao.url },
  { code: 'TH', name: 'タイ', cuisineName: 'タイ料理', flag: '🇹🇭', imageUrl: dummyPhotos.padThaiPlate.url },
  { code: 'VN', name: 'ベトナム', cuisineName: 'ベトナム料理', flag: '🇻🇳', imageUrl: dummyPhotos.phoBo.url },
  { code: 'IN', name: 'インド', cuisineName: 'インド料理', flag: '🇮🇳', imageUrl: dummyPhotos.chickenCurry.url },
  { code: 'IT', name: 'イタリア', cuisineName: 'イタリア料理', flag: '🇮🇹', imageUrl: dummyPhotos.pizzaMargherita.url },
  { code: 'FR', name: 'フランス', cuisineName: 'フランス料理', flag: '🇫🇷', imageUrl: dummyPhotos.croissant.url },
  { code: 'ES', name: 'スペイン', cuisineName: 'スペイン料理', flag: '🇪🇸', imageUrl: dummyPhotos.paella.url },
  { code: 'MX', name: 'メキシコ', cuisineName: 'メキシコ料理', flag: '🇲🇽', imageUrl: dummyPhotos.tacosBeef.url },
  { code: 'TR', name: 'トルコ', cuisineName: 'トルコ料理', flag: '🇹🇷', imageUrl: dummyPhotos.lahmacun.url },
  { code: 'US', name: 'アメリカ', cuisineName: 'アメリカ料理', flag: '🇺🇸', imageUrl: dummyPhotos.burger.url },
];

// ---------------------------------------------------------------
// ホーム
// ---------------------------------------------------------------

export const dummyFeatured: FeaturedCountry[] = [
  { id: 'f1', countryCode: 'IN', title: 'インド料理特集', description: 'スパイスカレーの名店めぐり', imageUrl: dummyPhotos.chickenCurry.url },
  { id: 'f2', countryCode: 'TH', title: 'タイ料理特集', description: 'パッタイ・トムヤムクンを食べに行こう', imageUrl: dummyPhotos.padThaiMenu.url },
  { id: 'f3', countryCode: 'IT', title: 'イタリア料理特集', description: '本場のピッツァが食べられるお店', imageUrl: dummyPhotos.pizzaPompei.url },
  { id: 'f4', countryCode: 'MX', title: 'メキシコ料理特集', description: 'タコスで手軽に海外旅行気分', imageUrl: dummyPhotos.tacosLime.url },
];

export const dummyVisitedShops: VisitedShop[] = [
  { id: 'v1', name: 'バーンタイ食堂', countryCode: 'TH', visitedAt: '2026-10-01', imageUrl: dummyPhotos.padThaiMenu.url },
  { id: 'v2', name: 'トラットリア・ローマ', countryCode: 'IT', visitedAt: '2026-09-24', imageUrl: dummyPhotos.pizzaSlice.url },
  { id: 'v3', name: 'タケリア・ソル', countryCode: 'MX', visitedAt: '2026-09-15', imageUrl: dummyPhotos.tacosBeef.url },
  { id: 'v4', name: 'フォー・サイゴン', countryCode: 'VN', visitedAt: '2026-09-02', imageUrl: dummyPhotos.phoBo.url },
];

// ---------------------------------------------------------------
// 地図に表示するお店（国ごとに3店）
// ---------------------------------------------------------------

// 予約サイトの仮のURL（APIができたら、お店ごとの本物のURLに置き換えます）
const DUMMY_RESERVATION_URL = 'https://www.hotpepper.jp/';

const shopNames: Record<CountryCode, [string, string, string]> = {
  JP: ['すし処 豊洲', '和食 こころ', '天ぷら 松'],
  KR: ['ソウル食堂', 'ビビンバ家', '韓国酒場 チング'],
  CN: ['上海小籠包', '四川飯店', '点心 楼'],
  TH: ['バーンタイ食堂', 'タイ屋台 サワディー', 'ガパオキッチン'],
  VN: ['フォー・サイゴン', 'バインミー屋', 'ハノイ食堂'],
  IN: ['スパイス・マハル', 'カレーハウス ガンジス', 'タンドール'],
  IT: ['トラットリア・ローマ', 'ピッツェリア ナポリ', 'オステリア'],
  FR: ['ビストロ パリ', 'ブラッスリー リヨン', 'ブーランジェリー'],
  ES: ['バル マドリード', 'パエリア専門店', 'タパス バルセロナ'],
  MX: ['タケリア・ソル', 'メキシカン カーサ', 'ブリトー屋'],
  TR: ['イスタンブール食堂', 'ケバブ ハウス', 'アナトリア'],
  US: ['バーガー ブルックリン', 'BBQ テキサス', 'アメリカン ダイナー'],
};

const shopPhotos: Record<CountryCode, string[]> = {
  JP: [dummyPhotos.sushi.url],
  KR: [dummyPhotos.bibimbap.url],
  CN: [dummyPhotos.xiaoLongBao.url],
  TH: [dummyPhotos.padThaiPlate.url, dummyPhotos.padThaiMenu.url],
  VN: [dummyPhotos.phoBo.url],
  IN: [dummyPhotos.chickenCurry.url],
  IT: [dummyPhotos.pizzaMargherita.url, dummyPhotos.pizzaSlice.url, dummyPhotos.pizzaPompei.url],
  FR: [dummyPhotos.croissant.url],
  ES: [dummyPhotos.paella.url],
  MX: [dummyPhotos.tacosBeef.url, dummyPhotos.tacosLime.url],
  TR: [dummyPhotos.lahmacun.url],
  US: [dummyPhotos.burger.url],
};

const shopDetails = [
  { access: '新宿駅 徒歩3分', budget: 'ディナー 2,000〜3,000円', position: { x: 0.25, y: 0.3 } },
  { access: '渋谷駅 徒歩5分', budget: 'ランチ 1,000〜1,500円', position: { x: 0.65, y: 0.22 } },
  { access: '豊洲駅 徒歩2分', budget: 'ディナー 3,000〜4,000円', position: { x: 0.45, y: 0.5 } },
];

export const dummyShops: Shop[] = dummyCountries.flatMap(country =>
  shopNames[country.code].map((name, index) => {
    const photos = shopPhotos[country.code];
    return {
      id: `${country.code}-${index + 1}`,
      name,
      countryCode: country.code,
      access: shopDetails[index].access,
      budget: shopDetails[index].budget,
      // 写真が足りない国は、同じ写真をくり返し使います
      photoUrls: [0, 1, 2].map(offset => photos[(index + offset) % photos.length]),
      reservationUrl: DUMMY_RESERVATION_URL,
      position: shopDetails[index].position,
    };
  }),
);

// ---------------------------------------------------------------
// 予約したお店（アプリを開いたときの初期データ）
// ---------------------------------------------------------------

export const dummyReservations: Reservation[] = [
  {
    id: 'r1',
    countryCode: 'TH',
    shopName: 'バーンタイ食堂',
    dateTime: '2026-10-18T19:00',
    info: '新宿駅 徒歩3分・ディナー 2,000〜3,000円',
    imageUrl: dummyPhotos.padThaiPlate.url,
    notify: true,
  },
  {
    id: 'r2',
    countryCode: 'ES',
    shopName: 'バル マドリード',
    dateTime: '2026-10-24T18:30',
    info: '渋谷駅 徒歩5分・ディナー 3,000〜4,000円',
    imageUrl: dummyPhotos.paella.url,
    notify: false,
  },
];
