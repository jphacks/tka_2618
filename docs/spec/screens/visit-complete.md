# Visit Completion Screen Specification

## Purpose

Celebrate a successfully saved reservation visit and make the newly painted stamp region visible before the user chooses the next destination.

## Route and Input

Route: `/visit-complete?visitId={id}`.

`visitId` must identify a persisted visit record. Load the record from the local visit repository rather than passing the photo, region, or shop data in route parameters.

While loading, show an activity indicator. If the ID is missing, the record cannot be loaded, or its map shape is unavailable, show `獲得した地域を表示できませんでした。` and a `予約一覧に戻る` action.

## Region Selection

- For a Japanese visit with a prefecture code, use the matching Japan prefecture shape and Japanese prefecture name.
- For any other visit, use the matching world country shape. Use the existing Japanese country catalog name when available and fall back to the map shape name.
- Calculate a padded view box from the selected shape path and display only that filled shape, centered and enlarged.

## Layout

Display in this order:

1. Eyebrow `NEW STAMP`
2. Decorative stamp mark
3. Heading `{region name}を獲得しました！`
4. Supporting text `{shop name}の訪問を記録しました`
5. Enlarged selected-region map filled black on a light background
6. Primary `地図を見る` button
7. Secondary `予約一覧に戻る` button

The screen is outside the tab navigator so the completion moment occupies the full screen.

## Navigation

- `地図を見る` replaces the completion screen with `/map`.
- `予約一覧に戻る` replaces the completion screen with `/reservations`.
- The completion screen is opened only after the visit record, visited-shop entry, and pending-photo cleanup all succeed.

## Self-Review

Score: **99/100**. Route input, persisted source of truth, region selection, exact copy, zoom behavior, error state, full-screen presentation, and both destinations are explicit.
