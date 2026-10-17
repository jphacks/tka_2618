// 予約や「訪れたお店」の記録を、アプリ全体で共有する場所です。
// どの画面からでも useAppData() で読み書きできます。
// 例: 「予約を作成」で保存 → 「予約したお店」の一覧にすぐ出る
//
// 今はアプリを閉じると元に戻ります（ダミーデータの状態）。
// あとでAPIにつなぐときは、add / remove の中で API を呼ぶようにします。

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getHomeData, getReservations } from './api';
import type { Reservation, VisitedShop } from './types';

type AppData = {
  reservations: Reservation[];
  visitedShops: VisitedShop[];
  addReservation: (reservation: Omit<Reservation, 'id'>) => void;
  removeReservation: (id: string) => void;
  addVisitedShop: (shop: Omit<VisitedShop, 'id'>) => void;
};

const AppDataContext = createContext<AppData | null>(null);

// 仮のID（APIにつないだら、サーバーが作ったIDを使います）
function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [visitedShops, setVisitedShops] = useState<VisitedShop[]>([]);

  // 最初のデータを読み込みます（今はダミーデータ）
  useEffect(() => {
    let active = true;
    Promise.all([getReservations(), getHomeData()]).then(([initialReservations, home]) => {
      if (!active) return;
      setReservations(initialReservations);
      setVisitedShops(home.visitedShops);
    });
    return () => {
      active = false;
    };
  }, []);

  const addReservation = useCallback((reservation: Omit<Reservation, 'id'>) => {
    setReservations(current =>
      // 予約日時が早い順に並べます
      [...current, { ...reservation, id: newId('r') }].sort((a, b) => a.dateTime.localeCompare(b.dateTime)),
    );
  }, []);

  const removeReservation = useCallback((id: string) => {
    setReservations(current => current.filter(reservation => reservation.id !== id));
  }, []);

  const addVisitedShop = useCallback((shop: Omit<VisitedShop, 'id'>) => {
    // 新しい記録を先頭に入れます
    setVisitedShops(current => [{ ...shop, id: newId('v') }, ...current]);
  }, []);

  const value = useMemo(
    () => ({ reservations, visitedShops, addReservation, removeReservation, addVisitedShop }),
    [reservations, visitedShops, addReservation, removeReservation, addVisitedShop],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData は AppDataProvider の中で使ってください');
  return value;
}
