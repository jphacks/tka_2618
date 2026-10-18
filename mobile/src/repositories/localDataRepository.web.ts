import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PendingVisitPhoto, Reservation, VisitedShop } from '../data/types';
import { emptyLocalAppData, type LocalAppData } from './localDataRepository.types';

const STORAGE_KEY = '@jphack/local-app-data/v1';
const SCHEMA_VERSION = 1;

type StoredPayload = LocalAppData & { version: number };

function isValidReservation(reservation: Reservation) {
  return typeof reservation?.id === 'string'
    && (typeof reservation.shopId === 'string' || reservation.shopId === undefined)
    && typeof reservation.countryCode === 'string'
    && (typeof reservation.prefectureCode === 'string' || reservation.prefectureCode === undefined)
    && typeof reservation.shopName === 'string'
    && typeof reservation.dateTime === 'string'
    && (typeof reservation.info === 'string' || reservation.info === undefined)
    && (typeof reservation.imageUrl === 'string' || reservation.imageUrl === undefined)
    && typeof reservation.notify === 'boolean'
    && (typeof reservation.notificationId === 'string' || reservation.notificationId === undefined);
}

function isValidVisitedShop(shop: VisitedShop) {
  return typeof shop?.id === 'string'
    && typeof shop.name === 'string'
    && typeof shop.countryCode === 'string'
    && typeof shop.visitedAt === 'string'
    && (typeof shop.imageUrl === 'string' || shop.imageUrl === undefined)
    && (typeof shop.memo === 'string' || shop.memo === undefined);
}

function isValidPayload(payload: StoredPayload) {
  return payload?.version === SCHEMA_VERSION
    && Array.isArray(payload.reservations)
    && payload.reservations.every(isValidReservation)
    && Array.isArray(payload.visitedShops)
    && payload.visitedShops.every(isValidVisitedShop)
    && typeof payload.notificationsEnabled === 'boolean'
    && (payload.pendingVisitPhoto === null
      || (typeof payload.pendingVisitPhoto?.reservationId === 'string' && typeof payload.pendingVisitPhoto.uri === 'string'));
}

export async function loadLocalAppData(): Promise<LocalAppData> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return emptyLocalAppData;
  try {
    const payload = JSON.parse(stored) as StoredPayload;
    if (!isValidPayload(payload)) return emptyLocalAppData;
    return {
      reservations: payload.reservations,
      visitedShops: payload.visitedShops,
      notificationsEnabled: payload.notificationsEnabled,
      pendingVisitPhoto: payload.pendingVisitPhoto,
    };
  } catch {
    return emptyLocalAppData;
  }
}

async function updateLocalAppData(update: (current: LocalAppData) => LocalAppData) {
  const next = update(await loadLocalAppData());
  const payload: StoredPayload = { version: SCHEMA_VERSION, ...next };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function saveReservation(reservation: Reservation) {
  return updateLocalAppData(current => ({
    ...current,
    reservations: [reservation, ...current.reservations.filter(item => item.id !== reservation.id)]
      .sort((left, right) => left.dateTime.localeCompare(right.dateTime)),
  }));
}

export function deleteReservation(id: string) {
  return updateLocalAppData(current => ({
    ...current,
    reservations: current.reservations.filter(item => item.id !== id),
    pendingVisitPhoto: current.pendingVisitPhoto?.reservationId === id ? null : current.pendingVisitPhoto,
  }));
}

export function saveVisitedShop(shop: VisitedShop) {
  return updateLocalAppData(current => ({
    ...current,
    visitedShops: [shop, ...current.visitedShops.filter(item => item.id !== shop.id)]
      .sort((left, right) => right.visitedAt.localeCompare(left.visitedAt)),
  }));
}

export function clearVisitedShops() {
  return updateLocalAppData(current => ({ ...current, visitedShops: [] }));
}

export function saveNotificationsEnabled(enabled: boolean) {
  return updateLocalAppData(current => ({ ...current, notificationsEnabled: enabled }));
}

export function savePendingVisitPhoto(photo: PendingVisitPhoto) {
  return updateLocalAppData(current => ({ ...current, pendingVisitPhoto: photo }));
}

export function deletePendingVisitPhoto() {
  return updateLocalAppData(current => ({ ...current, pendingVisitPhoto: null }));
}
