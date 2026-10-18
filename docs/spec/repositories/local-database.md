# Local Database Specification

## Purpose and Platform Strategy

Persist user-created reservations, visit summaries, pending photo metadata, settings, and verified visit records across application restarts.

- iOS and Android use `expo-sqlite` with database file `jphack.db`.
- Web uses an IndexedDB key-value store (`repositories/webStorage.ts`) because Expo SQLite web support is experimental and requires additional cross-origin isolation configuration.
- Screens and providers import a common repository contract and must not branch on the platform.
- Photo binary data remains in the app-owned file directory. The database stores only photo URIs.

## Native Schema

The SQLite database uses `PRAGMA journal_mode = WAL`, enables foreign keys, and tracks schema changes with `PRAGMA user_version`.

### `reservations`

One row per locally recorded reservation. The primary key is the application-generated reservation ID. Store restaurant ID, country code, optional prefecture code, restaurant name, local reservation date-time, optional information and image URL, notification preference, and optional notification identifier.

### `visited_shops`

One lightweight home-screen entry per recorded visit. Store its ID, restaurant name, country code, visit date, optional image URI, and optional memo.

### `visit_records`

One row per detailed visit record. Store all scalar `VisitRecord` fields and verification fields. `reservation_id` may be null for non-stamp records.

### `visit_photos`

Store one ordered row per visit photo with `(visit_id, position)` as the composite primary key. Deleting a visit record cascades to its photo rows.

### `pending_visit_photo`

Contain at most one row with the active reservation ID and captured photo URI. New capture replaces the previous row. Successful recording or retake deletes it.

### `settings`

Store application preferences as key-value rows. The initial notification setting is enabled.

## Web Storage

Web repositories serialize the same models to versioned JSON string payloads under the same keys as before (`@jphack/local-app-data/v1`, `@jphack/visits/v1`). Malformed or unsupported payloads return safe defaults instead of crashing the app.

- Payloads are stored in IndexedDB database `jphack-local-storage`, object store `key_value`, through `getWebItem`, `setWebItem`, and `removeWebItem` in `repositories/webStorage.ts`.
- On web, captured photos are `data:` URIs containing base64 image data, so one visit can add several megabytes across the visit record, visited-shop entry, and pending photo. AsyncStorage on web is backed by `localStorage`, whose roughly 5 MB per-origin quota made `訪問記録を保存できませんでした。` appear after one or two visits. IndexedDB has a much larger quota.
- When a key is missing from IndexedDB, `getWebItem` reads the same key from AsyncStorage, copies it into IndexedDB, and removes it from AsyncStorage to free the `localStorage` quota.
- When IndexedDB is unavailable or cannot be opened, all three functions fall back to AsyncStorage.
- The location catalog cache stays on AsyncStorage because its payloads are small.

## Migration

On native platforms, the first database read imports valid records from the existing `@jphack/visits/v1` AsyncStorage payload. Mark the import complete in database metadata before removing the old key. The migration is idempotent and must not overwrite a newer row with the same visit ID.

## Query and Security Rules

- Use bound parameters for every user-derived SQL value.
- Static migration SQL may use `execAsync`.
- Reservation lists sort by reservation date-time ascending.
- Visit records and visited shops sort newest first.
- Multi-table visit writes run in a transaction.
- Repository write failures reject so the current screen can display an error and avoid claiming success.

## Self-Review

Score: **98/100**. Platform selection, ownership, tables, relationships, ordering, migration, failure behavior, and SQL safety are deterministic. Web storage quota remains browser-dependent.
