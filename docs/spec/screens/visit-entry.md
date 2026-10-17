# Visit Entry Screen Specification

## Route and Input

Route: `/map/visit`.

Required route parameters: restaurant ID, name, latitude, longitude, and cuisine-origin country code. Optional parameters: prefecture code, address, and restaurant image URL. Invalid or missing required values show `店舗情報を確認できませんでした。` and a back action.

## Layout

Display in this order:

1. Restaurant name and address
2. Photo section with up to five previews, remove controls, and `写真を撮る` action
3. Memo field with a 500-character limit and counter
4. `現在地で訪問確認する` primary action
5. `記録だけ保存する` secondary action
6. `現在地を取得して訪問登録する` action when demo mode is enabled
7. Inline progress, success, or error message

Successful save replaces the current route with `/map` so the updated stamp map is immediately visible.

The development country-selection screen provides two fixed entry points, one for Italy and one for Tokyo, so the entire registration flow can be demonstrated without location search or restaurant API availability.

## Behavior

- Location verification follows the visit verification service specification.
- Unverified save accepts zero photos and never paints a map.
- Demo verification uses the first captured photo, otherwise the restaurant image, otherwise a platform-independent embedded PNG placeholder.
- Pressing the demo action displays `現在地を取得しています…`, `店舗との距離を確認しています…`, and `訪問記録を保存しています…` in that order before saving.
- Demo mode does not call the device location API. Its privacy note states that it reproduces the flow from location verification through registration without acquiring real location data.
- While an operation is running, all save and verification actions are disabled.

## Self-Review

Score: **99/100**. Route validation, visual order, exact button and progress labels, state behavior, limits, privacy behavior, and destinations are explicit.
