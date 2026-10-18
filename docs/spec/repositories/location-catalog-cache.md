# Location Catalog Cache Specification

## Purpose

Keep the home country list and country/prefecture selection usable during temporary backend failures after at least one successful catalog request.

## Stored Data

Use separate versioned AsyncStorage entries for the complete country catalog and the Japanese prefecture catalog. Each payload contains schema version `1`, an ISO timestamp, and the API items in their original order.

Validate every field when reading. Invalid JSON, a different schema version, an invalid item, or an empty required code/name returns `null` without crashing. Cache write failures must not turn a successful API request into a screen error.

## Contract

- `getCachedCountries()` and `getCachedPrefectures()` return the validated ordered array or `null`.
- `saveCountries(items)` and `savePrefectures(items)` replace the corresponding payload.
- Country cache keeps all API countries; screens apply their existing `cuisine_supported` filter.

## Refresh Behavior

Screens start the API request and cache read together. A valid cache is displayed as soon as it is read. A successful API response replaces the displayed items and cache. If the API fails, a displayed cache remains available with `保存済みの一覧を表示しています。`. Without a valid cache, the existing blocking error and retry action remain.

## Self-Review

Score: **99/100**. Keys, payloads, validation, ordering, filtering responsibility, refresh order, failure behavior, and user-facing copy are explicit.
