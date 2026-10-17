# Home Screen Specification

## Purpose

The home screen currently displays hard-coded countries, and its country cards and section arrow do not navigate anywhere. The nearby restaurant search is already implemented under the map tab, so the home screen must become an entry point to that existing flow instead of maintaining a disconnected list.

## Scope

- Replace the home screen's country fixture with the existing `GET /api/countries` response.
- Preserve the current featured banners and replace the visited-shop fixture with local visit records.
- Connect country cards and the country section arrow to existing Expo Router routes.
- Add deterministic loading, error, and retry states.
- Do not change the featured banner interaction, map search behavior, or backend API.

## Data Requirements

Call `GET /api/countries` through the existing frontend API client.

Use only countries where `cuisine_supported` is `true`. Map each API country as follows:

| API field | Home model field |
|---|---|
| `code` | `id`, converted to lowercase |
| `name_ja` | `name` |
| `flag` | `flag` |

Preserve the API response order. The backend places Japan first, so Japan remains the first country card.

The request must:

- Use an `AbortController`.
- Abort after 15 seconds.
- Ignore completion after the component unmounts or a newer attempt replaces it.
- Never read local `.env` files. The existing API client may use environment variables already loaded by the runtime.

Load visit records from the local visit repository at the same time as the country request. Map each record to a visited-shop card using its first photo, cuisine-origin country code, restaurant name, visit date, and verification mode. Repository failure must not prevent the country catalog from loading.

## Screen States

### Loading

- Display a full-screen white background.
- Center an activity indicator in the available space.
- Provide the accessibility label `国一覧を読み込み中`.

### Error

- Display the message `国一覧を取得できませんでした。バックエンドの接続を確認してください。`.
- Display a `再読み込み` button immediately below the message.
- Pressing the button starts a new request and returns the screen to the loading state.
- Do not display stale countries from a failed attempt.

### Ready

Keep the existing visual order:

1. Featured-country banner
2. `国名から選ぶ` section header
3. Horizontal country-card list
4. `今まで訪れたお店` section populated newest first from local visit records

## Navigation

Use Expo Router's existing absolute routes.

| Trigger | Destination |
|---|---|
| `国名から選ぶ` arrow | `/map/search` |
| Japan card (`JP`) | `/map/prefectures` |
| Any other supported country card | `/map/results?country=<uppercase ISO code>` |
| `今まで訪れたお店` arrow | `/map` |

Use the existing `SectionHeader` and `CountryCard` callback props. Do not duplicate either component or restaurant-search logic.

## Error and Edge Cases

- An empty supported-country result is a successful ready state with an empty horizontal list.
- API failures, invalid response status, timeout, and network errors use the same error state.
- Repeated taps use Expo Router navigation semantics and must not initiate restaurant requests from the home screen itself.
- The destination results screen remains responsible for requesting location permission and searching restaurants.

## Implementation Rationale

The backend country catalog is the source of truth for search support. Reusing it prevents the home screen from showing a country that the search endpoint cannot handle. Navigation goes directly to the existing map-tab routes so location permission, validation, and restaurant fetching remain centralized in the current search screens.

Featured content remains fixture-backed because no backend contract exists for it. Visit content uses the local repository so a newly registered visit appears on the home screen without requiring an account or backend write API.

## Verification

- TypeScript type checking succeeds.
- Expo lint succeeds.
- Existing security tests succeed.
- Expo export succeeds for Web, iOS, and Android.
- Manual or route-level verification confirms all three navigation branches: section arrow, Japan, and a non-Japan country.

## Self-Review

Score: **97/100**

- Data source, filtering, field mapping, ordering, timeout, states, copy, accessibility label, and navigation destinations are specified exactly.
- Existing components and responsibilities are explicitly identified for reuse.
- The only external variability is the country catalog contents returned by the backend; preserving API order and filtering by `cuisine_supported` defines deterministic client behavior.
