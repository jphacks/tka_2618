// アプリ全体の色・文字・余白をまとめた場所です。
// ここの値を変えると、すべての画面にまとめて反映されます。
// Figma「画面（整理版）」の、黒を基調にしたシンプルな配色に合わせています。

export const colors = {
  background: '#FFFFFF',
  // 入力欄・カード・ヘッダーなどの薄いグレーの面
  surface: '#F2F2F2',
  border: '#E0E0E0',

  text: '#121212',
  textSecondary: '#737373',
  textOnImage: '#FFFFFF',

  // メインのボタンなど（黒）
  primary: '#212121',
  onPrimary: '#FFFFFF',

  // 画像を読み込むまでの仮の色
  imagePlaceholder: '#D9D9D9',
  // 写真の上に文字を載せるときの暗い影
  imageShade: '#000000',

  // バナーのドット
  dot: 'rgba(255, 255, 255, 0.5)',
  dotActive: '#FFFFFF',

  // 国バッジ（国旗と国名の白いラベル）
  badgeBackground: '#FFFFFF',

  // ダイアログの後ろの暗幕
  scrim: 'rgba(0, 0, 0, 0.4)',

  // 地図で「食べた国」を塗る色
  visited: '#212121',
  notVisited: '#E0E0E0',
} as const;

// 選ばれていないタブの薄さ（0〜1）
export const tabInactiveOpacity = 0.35;

// 日本語は iOS では「ヒラギノ角ゴ」、Android では端末標準のフォントで表示されます。
// フォントを変えたいときは fontFamily をここに追加します。
export const fonts = {
  bannerTitle: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  sheetTitle: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  headerTitle: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  cardTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  item: { fontSize: 15, lineHeight: 24, fontWeight: '500' },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodyBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '700' },
  badge: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  tabLabel: { fontSize: 10, lineHeight: 16, fontWeight: '400' },
  tabLabelActive: { fontSize: 10, lineHeight: 16, fontWeight: '700' },
  buttonLarge: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
  buttonSmall: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
} as const;

// 余白はすべて8の倍数でそろえています。
export const spacing = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  // 画面の左右の余白（すべての画面で共通）
  screen: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
