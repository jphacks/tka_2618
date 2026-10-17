// 下のタブバーに並ぶタブの一覧です。
// name は src/app/ の中のファイル名（拡張子なし）と同じにします。
//
// タブを増やす手順:
//   1. src/app/ に画面ファイル（例: favorites.tsx）を作る
//   2. 下の配列に1行追加する

import type { ComponentType } from 'react';
import { AccountIcon, BookmarkIcon, HomeIcon, MapIcon, type IconProps } from '../components/Icons';

export type TabConfig = {
  name: string;
  label: string;
  Icon: ComponentType<IconProps>;
};

export const tabs: TabConfig[] = [
  { name: 'index', label: 'ホーム', Icon: HomeIcon },
  { name: 'map', label: '地図', Icon: MapIcon },
  { name: 'reservation', label: '予約', Icon: BookmarkIcon },
  { name: 'settings', label: '設定', Icon: AccountIcon },
];
