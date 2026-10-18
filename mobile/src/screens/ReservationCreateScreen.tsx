// 予約を作成する画面です（Figma の「予約を作成」）。
// 国・お店の名前・予約日時・通知を入力して「予約を保存」で一覧に戻ります。

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheet, SheetOption } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { FormField, SelectField, TextField } from '../components/FormField';
import { Header } from '../components/Header';
import { Toggle } from '../components/Toggle';
import { colors, fonts, spacing } from '../constants/theme';
import { useAppData } from '../data/AppDataContext';
import { dummyCountries } from '../data/dummy';
import { findCountry } from '../data/api';
import type { CountryCode } from '../data/types';
import { formatDay, formatDateTimeInput, todayString } from '../utils/date';

// 選べる日付（今日から2週間）と時刻（11:00〜22:30、30分ごと）
function upcomingDates(days = 14) {
  const today = new Date();
  return Array.from({ length: days }, (_, offset) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return todayString(date);
  });
}
const TIMES = Array.from({ length: 24 }, (_, index) => {
  const hour = 11 + Math.floor(index / 2);
  return `${hour}:${index % 2 === 0 ? '00' : '30'}`;
});

export function ReservationCreateScreen() {
  const { addReservation } = useAppData();
  const params = useLocalSearchParams<{
    shopId?: string;
    shopName?: string;
    countryCode?: string;
    imageUrl?: string;
    info?: string;
  }>();
  const insets = useSafeAreaInsets();
  const dates = useMemo(() => upcomingDates(), []);
  const initialCountry = findCountry(params.countryCode);

  const [countryCode, setCountryCode] = useState<CountryCode | null>(initialCountry?.code ?? null);
  const [shopName, setShopName] = useState(params.shopName ?? '');
  const [date, setDate] = useState(dates[0]);
  const [time, setTime] = useState('19:00');
  const [notify, setNotify] = useState(true);
  const [openSheet, setOpenSheet] = useState<'country' | 'dateTime' | null>(null);

  const country = findCountry(countryCode ?? undefined);
  const dateTime = `${date}T${time}`;
  const canSave = country !== undefined && shopName.trim().length > 0;

  const save = () => {
    if (!country) return;
    addReservation({
      shopId: params.shopId,
      countryCode: country.code,
      shopName: shopName.trim(),
      dateTime,
      notify,
      info: params.info,
      imageUrl: params.imageUrl ?? country.imageUrl,
    });
    router.back();
  };

  return (
    <View style={styles.screen}>
      <Header title="予約を作成" showBack />
      <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormField label="国">
            <SelectField
              accessibilityLabel="国を選択"
              placeholder="国を選択（12か国）"
              value={country ? `${country.flag} ${country.name}` : undefined}
              onPress={() => setOpenSheet('country')}
            />
          </FormField>

          <FormField label="お店の名前">
            <TextField
              accessibilityLabel="お店の名前"
              placeholder="例：バーンタイ食堂"
              value={shopName}
              onChangeText={setShopName}
              returnKeyType="done"
            />
          </FormField>

          <FormField label="予約日時">
            <SelectField
              accessibilityLabel="予約日時を選択"
              placeholder="日時を選択"
              value={formatDateTimeInput(dateTime)}
              onPress={() => setOpenSheet('dateTime')}
            />
          </FormField>

          <View style={styles.notifyRow}>
            <View style={styles.notifyText}>
              <Text style={styles.notifyTitle}>予約時間に通知する</Text>
              <Text style={styles.notifyNote}>時間になったらお知らせします</Text>
            </View>
            <Toggle value={notify} onValueChange={setNotify} accessibilityLabel="予約時間に通知する" />
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: spacing.screen }]}>
          <Button title="予約を保存" onPress={save} disabled={!canSave} />
          {!canSave && <Text style={styles.hint}>国とお店の名前を入力すると保存できます</Text>}
        </View>
      </KeyboardAvoidingView>

      <BottomSheet visible={openSheet === 'country'} title="国を選択" onClose={() => setOpenSheet(null)}>
        <ScrollView contentContainerStyle={styles.optionList}>
          {dummyCountries.map(item => (
            <SheetOption
              key={item.code}
              label={`${item.flag} ${item.name}`}
              selected={item.code === countryCode}
              onPress={() => {
                setCountryCode(item.code);
                setOpenSheet(null);
              }}
            />
          ))}
        </ScrollView>
      </BottomSheet>

      <BottomSheet visible={openSheet === 'dateTime'} title="予約日時" onClose={() => setOpenSheet(null)}>
        <View style={styles.dateTimeColumns}>
          <ScrollView style={styles.column} contentContainerStyle={styles.optionList}>
            {dates.map(item => (
              <SheetOption
                key={item}
                label={formatDay(item)}
                selected={item === date}
                onPress={() => setDate(item)}
              />
            ))}
          </ScrollView>
          <ScrollView style={styles.column} contentContainerStyle={styles.optionList}>
            {TIMES.map(item => (
              <SheetOption key={item} label={item} selected={item === time} onPress={() => setTime(item)} />
            ))}
          </ScrollView>
        </View>
        <View style={{ paddingBottom: insets.bottom > 0 ? 0 : spacing.sm }}>
          <Button title="決定" onPress={() => setOpenSheet(null)} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  content: {
    padding: spacing.screen,
    gap: spacing.lg,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  notifyText: {
    flex: 1,
    gap: 4,
  },
  notifyTitle: {
    ...fonts.bodyBold,
    color: colors.text,
  },
  notifyNote: {
    ...fonts.caption,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  hint: {
    ...fonts.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionList: {
    gap: 4,
    paddingBottom: spacing.sm,
  },
  dateTimeColumns: {
    flexDirection: 'row',
    gap: spacing.md,
    height: 320,
  },
  column: {
    flex: 1,
  },
});
