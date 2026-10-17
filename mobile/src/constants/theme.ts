// アプリ全体の色・文字・余白をまとめた場所です。
// ここの値を変えると、すべての画面にまとめて反映されます。

export const colors = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textOnImage: '#FFFFFF',

  // アプリのテーマ色（今いるタブなど）
  primary: '#E8613C',

  // 画像を読み込むまでの仮の色
  imagePlaceholder: '#E9E6E3',

  // 写真の上に文字を載せるときの暗い影
  imageShade: '#000000',

  // バナーのドット
  dot: 'rgba(255, 255, 255, 0.5)',
  dotActive: '#FFFFFF',

  // 写真の上に載せるラベル（国旗と国名）
  chipBackground: 'rgba(255, 255, 255, 0.92)',

  // 見出し横の矢印ボタン
  iconButtonBackground: '#F2F0EE',
  iconButtonIcon: '#1A1A1A',

  // タブバー
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E6E6E6',
  tabInactive: '#9A9A9A',
  tabActive: '#E8613C',
} as const;

// 日本語は iOS では「ヒラギノ角ゴ」、Android では端末標準のフォントで表示されます。
// フォントを変えたいときは fontFamily をここに追加します。
export const fonts = {
  bannerTitle: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  cardTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 24, fontWeight: '400' },
  bodyBold: { fontSize: 14, lineHeight: 24, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  tabLabel: { fontSize: 10, lineHeight: 16, fontWeight: '600' },
} as const;

// 余白はすべて8の倍数でそろえています。
export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // 画面の左右の余白（すべてのセクションで共通）
  screen: 16,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  full: 9999,
} as const;
