import { getWebItem, removeWebItem, setWebItem } from './webStorage';

import type { VisitRecord } from '../data/visitTypes';

const STORAGE_KEY = '@jphack/visits/v1';
const SCHEMA_VERSION = 1;

type StoredVisitPayload = {
  version: number;
  records: VisitRecord[];
};

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

export async function listVisits(): Promise<VisitRecord[]> {
  const stored = await getWebItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const payload = JSON.parse(stored) as StoredVisitPayload;
    if (payload.version !== SCHEMA_VERSION || !Array.isArray(payload.records)) return [];
    return payload.records.filter(isValidRecord).sort((left, right) => right.visitedAt.localeCompare(left.visitedAt));
  } catch {
    return [];
  }
}

export async function getVisitById(id: string): Promise<VisitRecord | null> {
  const visits = await listVisits();
  return visits.find(visit => visit.id === id) ?? null;
}

async function writeVisits(records: VisitRecord[]) {
  const payload: StoredVisitPayload = { version: SCHEMA_VERSION, records };
  await setWebItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function saveVisit(record: VisitRecord) {
  const visits = await listVisits();
  const next = [record, ...visits.filter(item => item.id !== record.id)];
  await writeVisits(next);
}

export async function clearVisits() {
  await removeWebItem(STORAGE_KEY);
}
