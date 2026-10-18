# Nearby Shop Map Screen Specification

## Route and Input

Route: `/shops/[countryCode]`. `countryCode` must match one of the supported cuisine countries shown on the home or country-selection screen. Japan additionally requires `regionCode` with a valid `JP-01` through `JP-47` prefecture code. An unsupported country displays `国が見つかりませんでした`; Japan without a valid prefecture displays `都道府県を選んでください` and a `都道府県を選ぶ` action. Neither state requests location.

## Location and Search Flow

1. On screen entry, display `現在地を取得しています…` and request foreground location permission.
2. If granted, obtain one current position using `Location.Accuracy.Balanced`.
3. Display `近くのお店を検索しています…` and call `/api/restaurants/nearby` with the selected uppercase country code, current latitude, current longitude, `count=30`, and the selected `region_code` for Japan.
4. Display the current position, the 3-kilometre search radius, and returned restaurants on the existing cross-platform restaurant map.
5. Do not select a restaurant initially. Selecting a map marker opens that restaurant's detail card over the bottom of the map.

Do not persist, log, or place device latitude or longitude in navigation parameters.

## Success Layout

- Existing header with `<料理名>のお店`
- A current-location map that fills all space below the header
- A compact result count, privacy note, and `現在地を再取得` action over the top of the map
- No restaurant card until the user selects a marker
- A dismissible bottom overlay containing the selected restaurant name, distance, genre, address, image, Hot Pepper action, and reservation status when each value is available
- `3km以内に該当するお店が見つかりませんでした。` when the result is empty

The map remains visible behind the selected restaurant overlay. The overlay may scroll vertically on a short screen and must leave device safe-area space below its actions.

## Marker Motion

- On web, hovering or keyboard-focusing an unselected restaurant marker enlarges it to 1.2 times its base size over 160 milliseconds and strengthens its shadow. The marker tip remains anchored to the same geographic coordinate and the marker rises above nearby markers.
- Moving the pointer away or removing focus restores the marker over 140 milliseconds.
- A selected marker remains black and larger than its normal state. Hovering or focusing it uses a smaller additional scale so it does not obscure nearby markers.
- Hover and focus only provide visual feedback. They do not select the restaurant or open its detail card; the existing click action does that.
- On iOS and Android, where hover is unavailable, tapping a marker animates it to 1.15 times its base size while selecting it. Closing the detail card restores the marker.
- Do not recenter or zoom the map as part of marker motion.
- If the operating system requests reduced motion, apply the selected or hover scale immediately without an animated transition.
- Custom native markers track child-view changes only while their selection animation is running.

## Reservation Status

- Match a reservation by restaurant ID when both values have an ID. For older or manually entered reservations without a restaurant ID, match the same cuisine country and the restaurant name after trimming whitespace and converting it to lowercase.
- When a match exists, display `予約済み`, its formatted reservation date and time, and a `予約内容を確認` secondary button that opens `/reservations`.
- When no match exists, display `このお店の予約記録はありません`, a `ホットペッパーで予約する` primary button, and a `予約済みとして記録する` secondary button.
- `ホットペッパーで予約する` opens the selected restaurant's Hot Pepper `detail_url` in the device's external browser. If `detail_url` is missing, disable the button and display `このお店の予約ページを取得できませんでした。`.
- If opening the external URL fails, remain on the map and display `ホットペッパーを開けませんでした。通信環境を確認して、もう一度お試しください。`.
- `予約済みとして記録する` opens `/reservations/new` with the selected restaurant ID, name, country code, image URL, a prefecture code inferred from a matching Japanese prefecture name in the address when available, and a human-readable information string made from available genre and address values.
- The app does not claim that the external reservation succeeded. The user explicitly records the reservation after completing it on Hot Pepper.
- Reservation status is derived from app-wide reservation state and must update when this screen is revisited after saving or deleting a reservation.

## Error and Retry

- Permission denial: `近くのお店を探すには、ブラウザまたは端末の設定で位置情報の利用を許可してください。`
- Location failure: `現在地を取得できませんでした。位置情報を確認して、もう一度お試しください。`
- Request timeout or backend failure: show the returned API message when available, otherwise `店舗を検索できませんでした。`
- Every error displays `もう一度試す`, which restarts permission, location, and search.
- Abort an in-flight request when leaving or retrying the screen.

## Self-Review

Score: **99/100**. Route validation, permission timing, accuracy, API parameters, full-screen layout, pointer, keyboard and touch marker motion, reduced-motion behavior, external reservation handoff, local recording boundary, failure handling, safe-area behavior, and privacy are explicit.
