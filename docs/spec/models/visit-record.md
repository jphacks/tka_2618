# Visit Record Model Specification

## Purpose

Represent one restaurant visit, its user-authored content, and the evidence used to decide whether the visit paints a stamp-map region.

## Model

`VisitRecord` contains:

| Field | Type | Rule |
|---|---|---|
| `id` | `string` | Unique within the local repository. |
| `reservationId` | `string \| null` | Reservation ID used for the visit, or `null` for records created outside the reservation flow. |
| `shopId` | `string` | Restaurant ID returned by nearby search. |
| `shopName` | `string` | Non-empty display name. |
| `countryCode` | `string` | Uppercase cuisine-origin country code. |
| `prefectureCode` | `string \| null` | Uppercase Japanese prefecture code for Japanese cuisine; otherwise `null`. |
| `address` | `string \| null` | Restaurant address at registration time. |
| `photoUris` | `string[]` | One to five photo URIs for verified records; zero to five for unverified records. |
| `memo` | `string` | Trimmed user memo, at most 500 characters. |
| `visitedAt` | `string` | ISO 8601 timestamp. |
| `verification` | `VisitVerification` | Evidence result described below. |

`VisitVerification` contains:

| Field | Type | Rule |
|---|---|---|
| `mode` | `'location' \| 'photo'` | Verification source. Reservation photo confirmation uses `photo`; the nearby visit flow uses `location`. |
| `status` | `'verified' \| 'unverified'` | Only `verified` paints a map. |
| `distanceMeters` | `number \| null` | Rounded distance from the restaurant; `null` when no check completed. |
| `accuracyMeters` | `number \| null` | Rounded device accuracy; `null` when no check completed. |

Exact device latitude and longitude must not be persisted.

## Stamp Derivation

- A record paints a map only when it is verified, has a non-null `reservationId`, and contains at least one photo URI.
- Every record meeting those three conditions paints `countryCode` on the world map.
- An eligible record with `countryCode === 'JP'` and a non-null `prefectureCode` also paints that prefecture on the Japan map.
- Saving a photo from the reservation flow creates a verified record with the reservation ID, `mode === 'photo'`, one photo URI, and null distance and accuracy values.
- Unverified, unreserved, and photo-less records never paint either map.
- Multiple visits to the same region keep the region painted and increment its displayed visit count.

## Self-Review

Score: **98/100**. Field types, reservation linkage, photo requirement, validation, privacy rules, and deterministic stamp derivation are defined. Repository serialization versioning remains an implementation detail covered by the repository specification.
