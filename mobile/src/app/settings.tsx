// 設定タブ（まだ中身はありません。開発用にバックエンドの接続確認だけ置いています）
import { ApiStatus } from '../components/ApiStatus';
import { PlaceholderScreen } from '../components/PlaceholderScreen';

export default function SettingsTab() {
  return (
    <PlaceholderScreen title="設定">
      <ApiStatus />
    </PlaceholderScreen>
  );
}
