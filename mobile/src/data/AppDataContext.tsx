// 予約や「訪れたお店」の記録を、アプリ全体で共有する場所です。
// どの画面からでも useAppData() で読み書きできます。
// 例: 「予約を作成」で保存 → 「予約したお店」の一覧にすぐ出る
//
// iOS / Android は SQLite、Web は IndexedDB（使えない場合は AsyncStorage）に保存します。

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearVisits } from '../repositories/visitRepository';
import {
  clearVisitedShops,
  deletePendingVisitPhoto,
  deleteReservation,
  loadLocalAppData,
  saveNotificationsEnabled,
  savePendingVisitPhoto,
  saveReservation,
  saveVisitedShop,
} from '../repositories/localDataRepository';
import type { CountryCode, PendingVisitPhoto, Reservation, VisitedShop } from './types';

type AppData = {
  isReady: boolean;
  reservations: Reservation[];
  visitedShops: VisitedShop[];
  // 食べた（記録した）国の国コード。地図を塗るのに使います
  visitedCountryCodes: Set<CountryCode>;
  // 設定画面の「予約時間に通知する」
  notificationsEnabled: boolean;
  pendingVisitPhoto: PendingVisitPhoto | null;
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<void>;
  removeReservation: (id: string) => Promise<void>;
  addVisitedShop: (shop: Omit<VisitedShop, 'id'>) => Promise<void>;
  resetVisitedShops: () => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setPendingVisitPhoto: (photo: PendingVisitPhoto) => Promise<void>;
  clearPendingVisitPhoto: () => Promise<void>;
};

const AppDataContext = createContext<AppData | null>(null);

// 仮のID（APIにつないだら、サーバーが作ったIDを使います）
function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [visitedShops, setVisitedShops] = useState<VisitedShop[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [pendingVisitPhoto, setPendingVisitPhoto] = useState<PendingVisitPhoto | null>(null);

  useEffect(() => {
    let active = true;
    loadLocalAppData()
      .then(data => {
        if (!active) return;
        setReservations(data.reservations);
        setVisitedShops(data.visitedShops);
        setNotificationsEnabledState(data.notificationsEnabled);
        setPendingVisitPhoto(data.pendingVisitPhoto);
      })
      .catch(() => {
        // 画面は空の状態で利用でき、各書き込み失敗は操作した画面で表示する。
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const addReservation = useCallback(async (reservation: Omit<Reservation, 'id'>) => {
    const next = { ...reservation, id: newId('r') };
    await saveReservation(next);
    setReservations(current => [...current, next].sort((a, b) => a.dateTime.localeCompare(b.dateTime)));
  }, []);

  const removeReservation = useCallback(async (id: string) => {
    await deleteReservation(id);
    setReservations(current => current.filter(reservation => reservation.id !== id));
    setPendingVisitPhoto(current => current?.reservationId === id ? null : current);
  }, []);

  const addVisitedShop = useCallback(async (shop: Omit<VisitedShop, 'id'>) => {
    const next = { ...shop, id: newId('v') };
    await saveVisitedShop(next);
    setVisitedShops(current => [next, ...current]);
  }, []);

  const resetVisitedShops = useCallback(async () => {
    await Promise.all([clearVisitedShops(), clearVisits()]);
    setVisitedShops([]);
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    await saveNotificationsEnabled(enabled);
    setNotificationsEnabledState(enabled);
  }, []);

  const persistPendingVisitPhoto = useCallback(async (photo: PendingVisitPhoto) => {
    await savePendingVisitPhoto(photo);
    setPendingVisitPhoto(photo);
  }, []);

  const clearPendingVisitPhoto = useCallback(async () => {
    await deletePendingVisitPhoto();
    setPendingVisitPhoto(null);
  }, []);

  const visitedCountryCodes = useMemo(
    () => new Set(visitedShops.map(shop => shop.countryCode)),
    [visitedShops],
  );

  const value = useMemo(
    () => ({
      isReady,
      reservations,
      visitedShops,
      visitedCountryCodes,
      notificationsEnabled,
      pendingVisitPhoto,
      addReservation,
      removeReservation,
      addVisitedShop,
      resetVisitedShops,
      setNotificationsEnabled,
      setPendingVisitPhoto: persistPendingVisitPhoto,
      clearPendingVisitPhoto,
    }),
    [
      isReady,
      reservations,
      visitedShops,
      visitedCountryCodes,
      notificationsEnabled,
      pendingVisitPhoto,
      addReservation,
      removeReservation,
      addVisitedShop,
      resetVisitedShops,
      setNotificationsEnabled,
      persistPendingVisitPhoto,
      clearPendingVisitPhoto,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData は AppDataProvider の中で使ってください');
  return value;
}
