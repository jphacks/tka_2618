// 設定画面です（Figma の「設定」）。
//
// ※ 通知は見た目だけの仮実装です（オン・オフを覚えるだけで、まだ通知は届きません）。
//    本物にするときは expo-notifications を入れて、予約時間に通知を予約します。

import { useState, type ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApiStatus } from '../components/ApiStatus';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Header } from '../components/Header';
import { SettingsItem } from '../components/SettingsItem';
import { Toggle } from '../components/Toggle';
import { colors, fonts, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { dummyPhotos } from '../data/dummy';

export function SettingsScreen() {
  const { notificationsEnabled, setNotificationsEnabled, resetVisitedShops } = useAppData();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [openSheet, setOpenSheet] = useState<'about' | 'credits' | null>(null);
  const [saveError, setSaveError] = useState('');

  const changeNotifications = async (enabled: boolean) => {
    setSaveError('');
    try {
      await setNotificationsEnabled(enabled);
    } catch {
      setSaveError('通知設定を保存できませんでした。');
    }
  };

  const resetRecords = async () => {
    setSaveError('');
    try {
      await resetVisitedShops();
      setConfirmingReset(false);
    } catch {
      setConfirmingReset(false);
      setSaveError('記録をリセットできませんでした。');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="設定" />
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="通知">
          <SettingsItem
            label="予約時間に通知する"
            right={
              <Toggle
                value={notificationsEnabled}
                onValueChange={enabled => void changeNotifications(enabled)}
                accessibilityLabel="予約時間に通知する"
              />
            }
          />
        </Section>

        <Section title="記録">
          <SettingsItem label="記録をリセット" onPress={() => setConfirmingReset(true)} />
        </Section>

        <Section title="このアプリについて">
          <SettingsItem label="このアプリについて" onPress={() => setOpenSheet('about')} />
          <SettingsItem label="クレジット表記" onPress={() => setOpenSheet('credits')} />
        </Section>

        <Section title="開発用">
          <ApiStatus />
        </Section>
        {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmingReset}
        title="記録をリセットしますか？"
        message="今まで訪れたお店と、地図の塗りがすべて消えます"
        confirmLabel="リセットする"
        onCancel={() => setConfirmingReset(false)}
        onConfirm={() => void resetRecords()}
      />

      <BottomSheet visible={openSheet === 'about'} title="このアプリについて" onClose={() => setOpenSheet(null)}>
        <Text style={styles.sheetText}>
          国を選んで、国内にあるその国の料理のお店を探せるアプリです。{'\n'}
          食べた料理の国が、世界地図・日本地図に塗られていきます。
        </Text>
      </BottomSheet>

      <BottomSheet visible={openSheet === 'credits'} title="クレジット表記" onClose={() => setOpenSheet(null)}>
        <ScrollView contentContainerStyle={styles.credits}>
          <Text style={styles.sheetText}>料理の写真は Unsplash（Unsplash License）の写真を使っています。</Text>
          {Object.values(dummyPhotos).map(photo => (
            <Pressable
              key={photo.url}
              accessibilityRole="link"
              onPress={() => Linking.openURL(photo.source)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.creditText}>Photo by {photo.photographer} on Unsplash</Text>
            </Pressable>
          ))}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// 「通知」「記録」などの見出しと、その下の項目のまとまり
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screen,
    gap: spacing.lg,
  },
  section: {
    gap: 4,
  },
  sectionTitle: {
    ...fonts.label,
    color: colors.textSecondary,
  },
  sheetText: {
    ...fonts.body,
    color: colors.text,
    paddingBottom: spacing.md,
  },
  credits: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  creditText: {
    ...fonts.body,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    ...fonts.caption,
    color: '#b33030',
    textAlign: 'center',
  },
});
