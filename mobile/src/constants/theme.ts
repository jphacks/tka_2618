// アプリ全体の色・文字・余白をまとめた場所です。
// ここの値を変えると、すべての画面にまとめて反映されます。

export const colors = {
  background: '#FFFFFF',
  text: '#000000',
  textOnDark: '#FFFFFF',

  // バナー（おすすめの国特集）
  bannerBackground: '#787878',
  dot: '#A8A8A8',
  dotActive: '#FFFFFF',

  // カード（画像が入るまでの仮の色）
  cardImage: '#D3D3D3',
  cardFooter: '#ADADAD',

  // 見出し横の矢印ボタン
  iconButton: '#868686',

  // タブバー
  tabBarBackground: '#FFFFFF',
  tabBarBorder: 'rgba(0, 0, 0, 0.25)',
  tabInactive: '#A6A6A6',
  tabActive: '#333333',
} as const;

// 日本語は iOS では「ヒラギノ角ゴ」、Android では端末標準のフォントで表示されます。
// フォントを変えたいときは fontFamily をここに追加します。
export const fonts = {
  heading: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  tabLabel: { fontSize: 10, fontWeight: '400' },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  // 画面の左右の余白
  screen: 24,
} as const;

export const radius = {
  sm: 14,
  md: 17,
  full: 9999,
} as const;
