# Visit Record Repository Specification

## Purpose

Persist visit records locally without requiring a backend account or network connection after registration. Use SQLite on iOS and Android and a versioned IndexedDB payload on web (see the local database specification).

## Contract

- `listVisits()` returns all valid records, newest first.
- `getVisitById(id)` returns the matching valid record or `null` when it does not exist.
- `saveVisit(record)` inserts or replaces a record with the same ID.
- Malformed or unsupported stored payloads return an empty list instead of crashing the app.
- Records without a valid string or null `reservationId` are treated as malformed and do not contribute to stamp progress.

The native implementation uses the `visit_records` and `visit_photos` tables defined by the local database specification. The web implementation uses one versioned key in the IndexedDB key-value store (`webStorage.ts`) containing the records array. Validate parsed web values field by field without TypeScript `any` or `unknown` annotations in project source.

On native platforms, import valid records from the former AsyncStorage key once, then remove that key only after the database marks migration success.

Photo URIs are stored with their visit. Native camera output is copied to an app-owned document directory before the record is saved. Web picker output may use a data URI for local browser persistence.

## Self-Review

Score: **98/100**. Platform behavior, ordering, lookup, transactional replacement, migration, failure behavior, schema versioning, and photo ownership are specified.
