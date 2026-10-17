# Visit Entry Screen Specification

## Route and Input

Route: `/search/visit`.

Required route parameters: restaurant ID, name, latitude, longitude, and cuisine-origin country code. Optional parameters: prefecture code, address, and restaurant image URL. Invalid or missing required values show `店舗情報を確認できませんでした。` and a back action.

## Layout

Display in this order:

1. Restaurant name and address
2. Photo section with up to five previews, remove controls, and `写真を撮る` action
3. Memo field with a 500-character limit and counter
4. `現在地で訪問確認する` primary action
5. `記録だけ保存する` secondary action
6. Inline progress, success, or error message

Successful save replaces the current route with `/map` so the updated stamp map is immediately visible.

## Behavior

- Location verification follows the visit verification service specification.
- Unverified save accepts zero photos and never paints a map.
- While an operation is running, all save and verification actions are disabled.

## Self-Review

Score: **98/100**. Route validation, visual order, button labels, state behavior, limits, privacy behavior, and destinations are explicit.
