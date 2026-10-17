import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VisitPhotoPicker } from '../components/VisitPhotoPicker';
import { DemoModeNotice } from '../components/DemoModeNotice';
import { MAX_VISIT_MEMO_LENGTH } from '../constants/visits';
import { colors, radius, spacing } from '../constants/theme';
import { DEMO_VISIT_PHOTO_URI } from '../data/demoVisits';
import type { VisitRecord, VisitVerification } from '../data/visitTypes';
import { saveVisit } from '../repositories/visitRepository';
import { captureVisitPhoto } from '../services/visitPhotos';
import { verifyCurrentVisit, verifyDemoVisit, type DemoVerificationStep } from '../services/visitVerification';
import { useDemoMode } from '../providers/DemoModeProvider';

type VisitParams = {
  shopId?: string | string[];
  shopName?: string | string[];
  latitude?: string | string[];
  longitude?: string | string[];
  country?: string | string[];
  region?: string | string[];
  address?: string | string[];
  imageUrl?: string | string[];
};

function single(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : '';
}

export function VisitEntryScreen() {
  const demoMode = useDemoMode();
  const params = useLocalSearchParams<VisitParams>();
  const shop = useMemo(() => {
    const latitude = Number(single(params.latitude));
    const longitude = Number(single(params.longitude));
    return {
      id: single(params.shopId),
      name: single(params.shopName),
      latitude,
      longitude,
      countryCode: single(params.country).toUpperCase(),
      prefectureCode: single(params.region).toUpperCase() || null,
      address: single(params.address) || null,
      imageUrl: single(params.imageUrl) || null,
      valid: Boolean(single(params.shopId) && single(params.shopName) && single(params.country) && Number.isFinite(latitude) && Number.isFinite(longitude)),
    };
  }, [params]);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const addPhoto = async () => {
    setMessage('');
    const result = await captureVisitPhoto();
    if (result.status === 'captured') setPhotoUris(current => [...current, result.uri]);
    if (result.status === 'error') { setIsError(true); setMessage(result.message); }
  };

  const persist = async (verification: VisitVerification, photos = photoUris) => {
    const record: VisitRecord = {
      id: `${shop.id}-${Date.now()}`,
      shopId: shop.id,
      shopName: shop.name,
      countryCode: shop.countryCode,
      prefectureCode: shop.countryCode === 'JP' ? shop.prefectureCode : null,
      address: shop.address,
      photoUris: photos,
      memo: memo.trim(),
      visitedAt: new Date().toISOString(),
      verification,
    };
    await saveVisit(record);
    router.replace('/map');
  };

  const verifyLocation = async () => {
    setBusy(true); setMessage('現在地を確認しています…'); setIsError(false);
    const result = await verifyCurrentVisit({ latitude: shop.latitude, longitude: shop.longitude }, photoUris.length > 0);
    if (!result.ok) { setBusy(false); setIsError(true); setMessage(result.message); return; }
    try {
      await persist(result.verification);
    } catch {
      setBusy(false); setIsError(true); setMessage('訪問記録を保存できませんでした。');
    }
  };

  const saveUnverified = async () => {
    setBusy(true); setMessage('記録を保存しています…'); setIsError(false);
    try {
      await persist({ mode: 'location', status: 'unverified', distanceMeters: null, accuracyMeters: null });
    } catch {
      setBusy(false); setIsError(true); setMessage('訪問記録を保存できませんでした。');
    }
  };

  const verifyDemo = async () => {
    const photos = photoUris.length > 0
      ? photoUris
      : [shop.imageUrl ?? DEMO_VISIT_PHOTO_URI];
    const progressMessages: Record<DemoVerificationStep, string> = {
      locating: '現在地を取得しています…',
      checking: '店舗との距離を確認しています…',
    };
    setBusy(true); setIsError(false);
    const result = await verifyDemoVisit(photos.length > 0, step => setMessage(progressMessages[step]));
    if (!result.ok) { setBusy(false); setIsError(true); setMessage(result.message); return; }
    setMessage('訪問記録を保存しています…');
    try {
      await persist(result.verification, photos);
    } catch {
      setBusy(false); setIsError(true); setMessage('デモ訪問を保存できませんでした。');
    }
  };

  if (!shop.valid) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Text accessibilityRole="alert" style={styles.error}>店舗情報を確認できませんでした。</Text>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>戻る</Text></Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={[]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>VISIT NOTE</Text>
        <Text accessibilityRole="header" style={styles.title}>{shop.name}</Text>
        {shop.address && <Text style={styles.address}>{shop.address}</Text>}

        {demoMode.enabled ? <DemoModeNotice /> : <VisitPhotoPicker photoUris={photoUris} disabled={busy} onAdd={() => void addPhoto()} onRemove={index => setPhotoUris(current => current.filter((_, itemIndex) => itemIndex !== index))} />}

        <View style={styles.memoSection}>
          <View style={styles.memoHeader}><Text accessibilityRole="header" style={styles.heading}>メモ</Text><Text style={styles.counter}>{memo.length}/{MAX_VISIT_MEMO_LENGTH}</Text></View>
          <TextInput
            accessibilityLabel="訪問メモ"
            editable={!busy}
            multiline
            maxLength={MAX_VISIT_MEMO_LENGTH}
            onChangeText={setMemo}
            placeholder="食べた料理や感想を残しましょう"
            style={styles.input}
            value={memo}
          />
        </View>

        {message && <Text accessibilityRole={isError ? 'alert' : undefined} style={isError ? styles.error : styles.status}>{message}</Text>}
        {busy && <ActivityIndicator color={colors.tabActive} />}

        {!demoMode.enabled && <Pressable accessibilityRole="button" disabled={busy} onPress={() => void verifyLocation()} style={({ pressed }) => [styles.primaryButton, busy && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>現在地で訪問確認する</Text>
        </Pressable>}
        {!demoMode.enabled && <Pressable accessibilityRole="button" disabled={busy} onPress={() => void saveUnverified()} style={({ pressed }) => [styles.secondaryButton, busy && styles.disabled, pressed && styles.pressed]}>
          <Text style={styles.secondaryText}>記録だけ保存する</Text>
        </Pressable>}
        {demoMode.enabled && (
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => void verifyDemo()} style={({ pressed }) => [styles.demoButton, busy && styles.disabled, pressed && styles.pressed]}>
            <Text style={styles.demoText}>現在地を取得して訪問登録する</Text>
          </Pressable>
        )}
        <Text style={styles.privacy}>{demoMode.enabled ? 'デモでは実際の位置情報を取得せず、現在地確認から訪問登録までの流れを再現します。' : '現在地の緯度・経度は保存しません。確認結果と店舗までの距離だけを保存します。'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.screen },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: spacing.screen, paddingBottom: 48, gap: spacing.lg },
  eyebrow: { color: '#66736f', fontSize: 12, letterSpacing: 2 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' },
  address: { color: '#52645f', fontSize: 14, lineHeight: 21, marginTop: -16 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  memoSection: { gap: spacing.sm },
  memoHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  counter: { color: '#66736f', fontSize: 13 },
  input: { minHeight: 132, borderWidth: 1, borderColor: '#cbd3d0', borderRadius: radius.sm, padding: 14, fontSize: 15, textAlignVertical: 'top', color: colors.text },
  primaryButton: { minHeight: 54, borderRadius: radius.sm, backgroundColor: colors.tabActive, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryText: { color: colors.textOnDark, fontSize: 16, fontWeight: '700' },
  secondaryButton: { minHeight: 52, borderRadius: radius.sm, borderWidth: 1, borderColor: '#aeb8b4', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondaryText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  demoButton: { minHeight: 52, borderRadius: radius.sm, backgroundColor: '#e8f4ed', borderWidth: 1, borderColor: '#90bca5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  demoText: { color: '#17613d', fontSize: 15, fontWeight: '700' },
  status: { color: '#17613d', textAlign: 'center' },
  error: { color: '#b33030', lineHeight: 22, textAlign: 'center' },
  privacy: { color: '#6f7d79', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.65 },
});
