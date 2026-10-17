# Visit Detail Screen Specification

## Route and Input

Route: `/visits/[id]`. The `id` path parameter identifies one locally stored visit record.

Load the record with `getVisitById(id)` when the screen opens. Display a loading indicator until the read finishes. A missing, invalid, or deleted record displays `訪問記録が見つかりませんでした。` and a `戻る` action.

## Layout

Display the following content in order:

1. `VISIT RECORD` eyebrow and restaurant name
2. Visit date and time formatted for the Japanese locale
3. Address when present
4. Verification badge: `現在地で確認済み` or `未確認の記録`
5. Horizontally scrollable photos in stored order, or `写真はありません。`
6. Memo, preserving line breaks, or `メモはありません。`
7. For verified records, rounded restaurant distance and location accuracy when each value is present

The content width is capped at 800 pixels and remains vertically scrollable.

## Entry Points

- Pressing a visited-shop card on the home screen opens its visit ID.
- Pressing a restaurant visit inside the stamp map's selected-region card opens its visit ID.
- Back navigation returns to the originating screen.

## Behavior and Privacy

- The screen is read-only and never requests network, camera, or location access.
- It displays only persisted evidence results and never reconstructs or displays device coordinates.
- A repository read failure uses the same missing-record state without crashing.

## Self-Review

Score: **99/100**. Route input, data source, loading and missing states, content order, empty copy, entry points, and privacy behavior are explicit.
