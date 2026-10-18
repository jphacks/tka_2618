import type { CountryCode, PendingVisitPhoto, Reservation, VisitedShop } from '../data/types';
import { getLocalDatabase } from './localDatabase.native';
import type { LocalAppData } from './localDataRepository.types';

type ReservationRow = {
  id: string;
  shop_id: string | null;
  country_code: string;
  prefecture_code: string | null;
  shop_name: string;
  date_time: string;
  info: string | null;
  image_url: string | null;
  notify: number;
  notification_id: string | null;
};

type VisitedShopRow = {
  id: string;
  name: string;
  country_code: string;
  visited_at: string;
  image_url: string | null;
  memo: string | null;
};

type PendingPhotoRow = { reservation_id: string; uri: string };
type SettingRow = { value: string };

function mapReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    shopId: row.shop_id ?? undefined,
    countryCode: row.country_code as CountryCode,
    prefectureCode: row.prefecture_code ?? undefined,
    shopName: row.shop_name,
    dateTime: row.date_time,
    info: row.info ?? undefined,
    imageUrl: row.image_url ?? undefined,
    notify: row.notify === 1,
    notificationId: row.notification_id ?? undefined,
  };
}

function mapVisitedShop(row: VisitedShopRow): VisitedShop {
  return {
    id: row.id,
    name: row.name,
    countryCode: row.country_code as CountryCode,
    visitedAt: row.visited_at,
    imageUrl: row.image_url ?? undefined,
    memo: row.memo ?? undefined,
  };
}

export async function loadLocalAppData(): Promise<LocalAppData> {
  const database = await getLocalDatabase();
  const [reservationRows, visitedRows, pendingPhoto, notificationSetting] = await Promise.all([
    database.getAllAsync<ReservationRow>('SELECT * FROM reservations ORDER BY date_time ASC'),
    database.getAllAsync<VisitedShopRow>('SELECT * FROM visited_shops ORDER BY visited_at DESC'),
    database.getFirstAsync<PendingPhotoRow>('SELECT reservation_id, uri FROM pending_visit_photo WHERE singleton_id = 1'),
    database.getFirstAsync<SettingRow>("SELECT value FROM settings WHERE key = 'notifications_enabled'"),
  ]);
  return {
    reservations: reservationRows.map(mapReservation),
    visitedShops: visitedRows.map(mapVisitedShop),
    notificationsEnabled: notificationSetting?.value !== 'false',
    pendingVisitPhoto: pendingPhoto ? { reservationId: pendingPhoto.reservation_id, uri: pendingPhoto.uri } : null,
  };
}

export async function saveReservation(reservation: Reservation) {
  const database = await getLocalDatabase();
  await database.runAsync(
    `INSERT INTO reservations (
      id, shop_id, country_code, prefecture_code, shop_name, date_time, info, image_url, notify, notification_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      shop_id = excluded.shop_id,
      country_code = excluded.country_code,
      prefecture_code = excluded.prefecture_code,
      shop_name = excluded.shop_name,
      date_time = excluded.date_time,
      info = excluded.info,
      image_url = excluded.image_url,
      notify = excluded.notify,
      notification_id = excluded.notification_id`,
    reservation.id,
    reservation.shopId ?? null,
    reservation.countryCode,
    reservation.prefectureCode ?? null,
    reservation.shopName,
    reservation.dateTime,
    reservation.info ?? null,
    reservation.imageUrl ?? null,
    reservation.notify ? 1 : 0,
    reservation.notificationId ?? null,
  );
}

export async function deleteReservation(id: string) {
  const database = await getLocalDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM reservations WHERE id = ?', id);
    await database.runAsync('DELETE FROM pending_visit_photo WHERE reservation_id = ?', id);
  });
}

export async function saveVisitedShop(shop: VisitedShop) {
  const database = await getLocalDatabase();
  await database.runAsync(
    `INSERT INTO visited_shops (id, name, country_code, visited_at, image_url, memo)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       country_code = excluded.country_code,
       visited_at = excluded.visited_at,
       image_url = excluded.image_url,
       memo = excluded.memo`,
    shop.id,
    shop.name,
    shop.countryCode,
    shop.visitedAt,
    shop.imageUrl ?? null,
    shop.memo ?? null,
  );
}

export async function clearVisitedShops() {
  const database = await getLocalDatabase();
  await database.execAsync('DELETE FROM visited_shops;');
}

export async function saveNotificationsEnabled(enabled: boolean) {
  const database = await getLocalDatabase();
  await database.runAsync(
    `INSERT INTO settings (key, value) VALUES ('notifications_enabled', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    enabled ? 'true' : 'false',
  );
}

export async function savePendingVisitPhoto(photo: PendingVisitPhoto) {
  const database = await getLocalDatabase();
  await database.runAsync(
    `INSERT INTO pending_visit_photo (singleton_id, reservation_id, uri) VALUES (1, ?, ?)
     ON CONFLICT(singleton_id) DO UPDATE SET reservation_id = excluded.reservation_id, uri = excluded.uri`,
    photo.reservationId,
    photo.uri,
  );
}

export async function deletePendingVisitPhoto() {
  const database = await getLocalDatabase();
  await database.runAsync('DELETE FROM pending_visit_photo WHERE singleton_id = 1');
}
