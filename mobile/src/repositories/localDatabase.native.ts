import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'jphack.db';
const DATABASE_VERSION = 1;

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrateDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const version = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((version?.user_version ?? 0) >= DATABASE_VERSION) return;

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY NOT NULL,
      shop_id TEXT,
      country_code TEXT NOT NULL,
      prefecture_code TEXT,
      shop_name TEXT NOT NULL,
      date_time TEXT NOT NULL,
      info TEXT,
      image_url TEXT,
      notify INTEGER NOT NULL,
      notification_id TEXT
    );
    CREATE INDEX IF NOT EXISTS reservations_date_time_idx ON reservations(date_time);

    CREATE TABLE IF NOT EXISTS visited_shops (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      country_code TEXT NOT NULL,
      visited_at TEXT NOT NULL,
      image_url TEXT,
      memo TEXT
    );
    CREATE INDEX IF NOT EXISTS visited_shops_visited_at_idx ON visited_shops(visited_at DESC);

    CREATE TABLE IF NOT EXISTS visit_records (
      id TEXT PRIMARY KEY NOT NULL,
      reservation_id TEXT,
      shop_id TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      country_code TEXT NOT NULL,
      prefecture_code TEXT,
      address TEXT,
      memo TEXT NOT NULL,
      visited_at TEXT NOT NULL,
      verification_mode TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      distance_meters REAL,
      accuracy_meters REAL
    );
    CREATE INDEX IF NOT EXISTS visit_records_visited_at_idx ON visit_records(visited_at DESC);

    CREATE TABLE IF NOT EXISTS visit_photos (
      visit_id TEXT NOT NULL REFERENCES visit_records(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      uri TEXT NOT NULL,
      PRIMARY KEY (visit_id, position)
    );

    CREATE TABLE IF NOT EXISTS pending_visit_photo (
      singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
      reservation_id TEXT NOT NULL,
      uri TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    PRAGMA user_version = 1;
  `);
}

export function getLocalDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).then(async database => {
      await migrateDatabase(database);
      return database;
    });
  }
  return databasePromise;
}
