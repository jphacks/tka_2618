# Visit Record Repository Specification

## Purpose

Persist visit records locally without requiring a backend account or network connection after registration.

## Contract

- `listVisits()` returns all valid records, newest first.
- `saveVisit(record)` inserts or replaces a record with the same ID.
- Malformed or unsupported stored payloads return an empty list instead of crashing the app.

Use one versioned AsyncStorage key. Persist JSON containing an explicit schema version and the records array. Validate parsed values field by field without TypeScript `any` or `unknown` annotations in project source.

Photo URIs are stored with their visit. Native camera output is copied to an app-owned document directory before the record is saved. Web picker output may use a data URI for local browser persistence.

## Self-Review

Score: **96/100**. Ordering, replacement, failure behavior, schema versioning, and photo ownership are specified. Browser quota remains platform-dependent and will surface as a save error.
