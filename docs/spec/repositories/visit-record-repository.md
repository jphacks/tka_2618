# Visit Record Repository Specification

## Purpose

Persist visit records locally so the demonstration works without a backend account or network connection.

## Contract

- `listVisits()` returns all valid records, newest first.
- `saveVisit(record)` inserts or replaces a record with the same ID.
- `clearDemoVisits()` deletes records whose verification mode is `demo` and preserves other records.
- Malformed or unsupported stored payloads return an empty list instead of crashing the app.

Use one versioned AsyncStorage key. Persist JSON containing an explicit schema version and the records array. Validate parsed values field by field without TypeScript `any` or `unknown` annotations in project source.

Photo URIs are stored with their visit. Native camera output is copied to an app-owned document directory before the record is saved. Web picker output may use a data URI for local demonstration persistence.

## Self-Review

Score: **95/100**. Ordering, replacement, deletion, failure behavior, schema versioning, and photo ownership are specified. Browser quota remains platform-dependent and will surface as a save error.
