// アプリで扱うデータの「形」です。
// APIから受け取るデータも、この形に合わせて使います。

export type Country = {
  id: string;
  name: string;
  flag: string; // 国旗の絵文字（例: 🇧🇷）
  imageUrl?: string; // 料理などの画像。なければ灰色の仮表示
};

export type FeaturedCountry = {
  id: string;
  countryId: string;
  title: string;
  description: string;
  imageUrl?: string;
};

export type VisitedShop = {
  id: string;
  name: string;
  countryId: string;
  visitedAt: string; // 例: '2026-10-01'
  imageUrl?: string;
};

export type HomeData = {
  featured: FeaturedCountry[];
  countries: Country[];
  visitedShops: VisitedShop[];
};
