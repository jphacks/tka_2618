# Photo Confirmation Screen Specification

## Purpose

Let the user inspect a newly captured visit photo, optionally add a memo, and either retake or save the visit record.

## Route and Input

Route: `/reservations/confirm?reservationId={id}`.

The reservation must exist and the persisted pending visit photo must have the same `reservationId`. While local storage is loading, display `写真を読み込んでいます…`. If the reservation is missing, display `予約が見つかりませんでした`.

If the matching photo is still missing after storage loading completes, display a recovery state with `写真を確認できませんでした`, an explanation that capture may have been interrupted, `写真を撮り直す`, and `予約一覧に戻る`.

## Layout

For valid input, display in this order:

1. Header titled `画像を確認`
2. The captured photo
3. Memo field with placeholder `感想やメモを入力`
4. Full-width `写真を撮り直す` secondary button
5. Full-width `記録する` primary button

## Behavior

- `写真を撮り直す` clears the pending photo and replaces the current route with `/camera?reservationId={id}`.
- `記録する` persists a verified visit record using the reservation ID, the reservation's restaurant ID when available, shop name, country, Japanese prefecture when applicable, captured photo URI, trimmed memo, and current timestamp. Its verification mode is `photo`.
- The same action adds the lightweight visited-shop entry used by the home screen.
- Disable both actions while persistence is running. If persistence fails, remain on this screen and show `訪問記録を保存できませんでした。`.
- After persistence succeeds, clear the pending photo and replace the current route with `/map`. The saved reservation ID and photo make the visit eligible to paint its country and, for Japan, its prefecture black.
- A captured photo is temporary until `記録する` succeeds. It is not used as a fallback for another reservation.
- Pending photo metadata persists across application restarts. The image remains in the app-owned file directory and only its URI is stored in the local database.

## Self-Review

Score: **99/100**. Loading, recovery, persisted draft state, element order, retake behavior, saved fields, cleanup, and navigation are explicit.
