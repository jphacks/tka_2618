// 下のタブバーに並ぶタブの一覧です。
// name は src/app/(tabs)/ の中のファイル名・フォルダ名と同じにします。
//   (home)       … ホーム（中に「国名から選ぶ」などの画面を重ねられるフォルダ）
//   map          … 地図
//   reservations … 予約したお店（中に「予約を作成」などの画面を重ねられるフォルダ）
//   settings     … 設定

import type { ComponentType } from 'react';
import { AccountIcon, BookmarkIcon, HomeIcon, MapIcon, type IconProps } from '../components/Icons';

export type TabConfig = {
  name: string;
  label: string;
  Icon: ComponentType<IconProps>;
};

export const tabs: TabConfig[] = [
  { name: '(home)', label: 'ホーム', Icon: HomeIcon },
  { name: 'map', label: '地図', Icon: MapIcon },
  { name: 'reservations', label: '予約', Icon: BookmarkIcon },
  { name: 'settings', label: '設定', Icon: AccountIcon },
];
