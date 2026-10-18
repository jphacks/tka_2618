# Visit Record Repository Specification

## Purpose

Persist visit records locally without requiring a backend account or network connection after registration.

## Contract

- `listVisits()` returns all valid records, newest first.
- `getVisitById(id)` returns the matching valid record or `null` when it does not exist.
- `saveVisit(record)` inserts or replaces a record with the same ID.
- Malformed or unsupported stored payloads return an empty list instead of crashing the app.
- Records without a valid string or null `reservationId` are treated as malformed and do not contribute to stamp progress.

Use one versioned AsyncStorage key. Persist JSON containing an explicit schema version and the records array. Validate parsed values field by field without TypeScript `any` or `unknown` annotations in project source.

Photo URIs are stored with their visit. Native camera output is copied to an app-owned document directory before the record is saved. Web picker output may use a data URI for local browser persistence.

## Self-Review

Score: **97/100**. Ordering, lookup, replacement, failure behavior, schema versioning, and photo ownership are specified. Browser quota remains platform-dependent and will surface as a save error.
