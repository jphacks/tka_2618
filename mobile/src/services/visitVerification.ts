import * as Location from 'expo-location';

import {
  DEMO_VISIT_DISTANCE_METERS,
  MAX_LOCATION_ACCURACY_METERS,
  MAX_VISIT_DISTANCE_METERS,
} from '../constants/visits';
import type { VisitVerification } from '../data/visitTypes';

type Coordinates = { latitude: number; longitude: number };

export type VerificationResult =
  | { ok: true; verification: VisitVerification }
  | { ok: false; message: string };

const EARTH_RADIUS_METERS = 6_371_000;

function degreesToRadians(value: number) {
  return value * Math.PI / 180;
}

export function calculateDistanceMeters(start: Coordinates, end: Coordinates) {
  const latitudeDelta = degreesToRadians(end.latitude - start.latitude);
  const longitudeDelta = degreesToRadians(end.longitude - start.longitude);
  const startLatitude = degreesToRadians(start.latitude);
  const endLatitude = degreesToRadians(end.latitude);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export async function verifyCurrentVisit(restaurant: Coordinates, hasPhoto: boolean): Promise<VerificationResult> {
  if (!hasPhoto) return { ok: false, message: '訪問確認には写真を1枚以上撮影してください。' };

  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    return { ok: false, message: '現在地で確認するには、端末の設定で位置情報を許可してください。' };
  }

  try {
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const accuracy = current.coords.accuracy;
    if (accuracy === null || accuracy > MAX_LOCATION_ACCURACY_METERS) {
      return { ok: false, message: '位置情報の精度が不足しています。屋外に移動して、もう一度お試しください。' };
    }

    const distance = calculateDistanceMeters(
      { latitude: current.coords.latitude, longitude: current.coords.longitude },
      restaurant,
    );
    if (distance > MAX_VISIT_DISTANCE_METERS) {
      return { ok: false, message: `店舗から約${Math.round(distance).toLocaleString()}m離れています。300m以内で確認してください。` };
    }

    return {
      ok: true,
      verification: {
        mode: 'location',
        status: 'verified',
        distanceMeters: Math.round(distance),
        accuracyMeters: Math.round(accuracy),
      },
    };
  } catch {
    return { ok: false, message: '現在地を取得できませんでした。位置情報を確認して、もう一度お試しください。' };
  }
}

export function createDemoVerification(hasPhoto: boolean): VerificationResult {
  if (!hasPhoto) return { ok: false, message: 'デモ訪問に使用する写真がありません。' };
  return {
    ok: true,
    verification: {
      mode: 'demo',
      status: 'verified',
      distanceMeters: DEMO_VISIT_DISTANCE_METERS,
      accuracyMeters: null,
    },
  };
}
