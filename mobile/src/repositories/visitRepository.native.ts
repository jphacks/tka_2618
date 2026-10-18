import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { VisitRecord, VisitVerification } from '../data/visitTypes';
import { getLocalDatabase } from './localDatabase.native';

const LEGACY_STORAGE_KEY = '@jphack/visits/v1';
const LEGACY_SCHEMA_VERSION = 1;
const LEGACY_MIGRATION_KEY = 'legacy_visits_v1_imported';

type StoredVisitPayload = { version: number; records: VisitRecord[] };
type VisitRow = {
  id: string;
  reservation_id: string | null;
  shop_id: string;
  shop_name: string;
  country_code: string;
  prefecture_code: string | null;
  address: string | null;
  memo: string;
  visited_at: string;
  verification_mode: string;
  verification_status: string;
  distance_meters: number | null;
  accuracy_meters: number | null;
};
type PhotoRow = { visit_id: string; position: number; uri: string };
type MetadataRow = { value: string };

function isValidRecord(record: VisitRecord) {
  return typeof record?.id === 'string'
    && (typeof record.reservationId === 'string' || record.reservationId === null)
    && typeof record.shopId === 'string'
    && typeof record.shopName === 'string'
    && typeof record.countryCode === 'string'
    && (typeof record.prefectureCode === 'string' || record.prefectureCode === null)
    && (typeof record.address === 'string' || record.address === null)
    && Array.isArray(record.photoUris)
    && record.photoUris.every(uri => typeof uri === 'string')
    && typeof record.memo === 'string'
    && typeof record.visitedAt === 'string'
    && (record.verification?.mode === 'location' || record.verification?.mode === 'photo')
    && (record.verification.status === 'verified' || record.verification.status === 'unverified')
    && (typeof record.verification.distanceMeters === 'number' || record.verification.distanceMeters === null)
    && (typeof record.verification.accuracyMeters === 'number' || record.verification.accuracyMeters === null);
}

async function writeVisit(database: SQLiteDatabase, record: VisitRecord, replace: boolean) {
  const conflictAction = replace ? 'DO UPDATE SET' : 'DO NOTHING';
  const updateFields = replace ? `
    reservation_id = excluded.reservation_id,
    shop_id = excluded.shop_id,
    shop_name = excluded.shop_name,
    country_code = excluded.country_code,
    prefecture_code = excluded.prefecture_code,
    address = excluded.address,
    memo = excluded.memo,
    visited_at = excluded.visited_at,
    verification_mode = excluded.verification_mode,
    verification_status = excluded.verification_status,
    distance_meters = excluded.distance_meters,
    accuracy_meters = excluded.accuracy_meters` : '';
  await database.runAsync(
    `INSERT INTO visit_records (
      id, reservation_id, shop_id, shop_name, country_code, prefecture_code, address, memo, visited_at,
      verification_mode, verification_status, distance_meters, accuracy_meters
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) ${conflictAction} ${updateFields}`,
    record.id,
    record.reservationId,
    record.shopId,
    record.shopName,
    record.countryCode,
    record.prefectureCode,
    record.address,
    record.memo,
    record.visitedAt,
    record.verification.mode,
    record.verification.status,
    record.verification.distanceMeters,
    record.verification.accuracyMeters,
  );
  if (replace) await database.runAsync('DELETE FROM visit_photos WHERE visit_id = ?', record.id);
  for (const [position, uri] of record.photoUris.entries()) {
    await database.runAsync(
      'INSERT OR IGNORE INTO visit_photos (visit_id, position, uri) VALUES (?, ?, ?)',
      record.id,
      position,
      uri,
    );
  }
}

async function migrateLegacyVisits(database: SQLiteDatabase) {
  const migrated = await database.getFirstAsync<MetadataRow>(
    'SELECT value FROM local_metadata WHERE key = ?',
    LEGACY_MIGRATION_KEY,
  );
  if (migrated?.value === 'true') return;

  const stored = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
  let records: VisitRecord[] = [];
  if (stored) {
    try {
      const payload = JSON.parse(stored) as StoredVisitPayload;
      if (payload.version === LEGACY_SCHEMA_VERSION && Array.isArray(payload.records)) {
        records = payload.records.filter(isValidRecord);
      }
    } catch {
      records = [];
    }
  }

  await database.withTransactionAsync(async () => {
    for (const record of records) await writeVisit(database, record, false);
    await database.runAsync(
      `INSERT INTO local_metadata (key, value) VALUES (?, 'true')
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      LEGACY_MIGRATION_KEY,
    );
  });
  await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
}

async function readyDatabase() {
  const database = await getLocalDatabase();
  await migrateLegacyVisits(database);
  return database;
}

export async function listVisits(): Promise<VisitRecord[]> {
  const database = await readyDatabase();
  const [rows, photos] = await Promise.all([
    database.getAllAsync<VisitRow>('SELECT * FROM visit_records ORDER BY visited_at DESC'),
    database.getAllAsync<PhotoRow>('SELECT visit_id, position, uri FROM visit_photos ORDER BY visit_id, position'),
  ]);
  const photosByVisit = new Map<string, string[]>();
  photos.forEach(photo => {
    const current = photosByVisit.get(photo.visit_id) ?? [];
    current[photo.position] = photo.uri;
    photosByVisit.set(photo.visit_id, current);
  });
  return rows.map(row => ({
    id: row.id,
    reservationId: row.reservation_id,
    shopId: row.shop_id,
    shopName: row.shop_name,
    countryCode: row.country_code,
    prefectureCode: row.prefecture_code,
    address: row.address,
    photoUris: (photosByVisit.get(row.id) ?? []).filter(uri => typeof uri === 'string'),
    memo: row.memo,
    visitedAt: row.visited_at,
    verification: {
      mode: row.verification_mode as VisitVerification['mode'],
      status: row.verification_status as VisitVerification['status'],
      distanceMeters: row.distance_meters,
      accuracyMeters: row.accuracy_meters,
    },
  }));
}

export async function getVisitById(id: string): Promise<VisitRecord | null> {
  const visits = await listVisits();
  return visits.find(visit => visit.id === id) ?? null;
}

export async function saveVisit(record: VisitRecord) {
  const database = await readyDatabase();
  await database.withTransactionAsync(async () => writeVisit(database, record, true));
}

export async function clearVisits() {
  const database = await readyDatabase();
  await database.execAsync('DELETE FROM visit_records;');
}
