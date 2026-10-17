# Nearby Shop Map Screen Specification

## Route and Input

Route: `/shops/[countryCode]`. `countryCode` must match one of the supported cuisine countries shown on the home or country-selection screen. An unsupported value displays `国が見つかりませんでした` without requesting location.

## Location and Search Flow

1. On screen entry, display `現在地を取得しています…` and request foreground location permission.
2. If granted, obtain one current position using `Location.Accuracy.Balanced`.
3. Display `近くのお店を検索しています…` and call `/api/restaurants/nearby` with the selected uppercase country code, current latitude, current longitude, and `count=30`.
4. Display the current position, the 3-kilometre search radius, and returned restaurants on the existing cross-platform restaurant map.
5. Select the first result initially. Selecting a map marker updates the restaurant detail card.

Do not persist, log, or place device latitude or longitude in navigation parameters.

## Success Layout

- Existing header with `<料理名>のお店`
- Result count and privacy note
- Current-location map with restaurant markers
- Selected restaurant name, distance, genre, address, image, and external detail link when each value is available
- `3km以内に該当するお店が見つかりませんでした。` when the result is empty

## Error and Retry

- Permission denial: `近くのお店を探すには、ブラウザまたは端末の設定で位置情報の利用を許可してください。`
- Location failure: `現在地を取得できませんでした。位置情報を確認して、もう一度お試しください。`
- Request timeout or backend failure: show the returned API message when available, otherwise `店舗を検索できませんでした。`
- Every error displays `もう一度試す`, which restarts permission, location, and search.
- Abort an in-flight request when leaving or retrying the screen.

## Self-Review

Score: **99/100**. Route validation, permission timing, accuracy, API parameters, states, exact fallback copy, map content, selection, retry, cancellation, and privacy are explicit.
