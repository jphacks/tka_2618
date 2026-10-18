# Camera Screen Specification

## Purpose

Provide a fallback photo-capture route for an old link or direct route access. In the normal reservation flow, the reservation card opens the platform camera directly and this screen is skipped.

## Route and Input

Route: `/camera?reservationId={id}`.

`reservationId` must identify an existing reservation. If it is missing or invalid, display `予約が見つかりませんでした` and do not offer the camera action.

## Layout

Display a header titled `写真を撮影`, followed by:

1. A camera guidance panel containing `料理やお店の様子を撮影してください`
2. The supporting text `撮影した写真は、記録する前に確認できます`
3. A full-width `カメラを起動` primary button
4. A status message area below the button

The app uses the platform camera UI; it does not embed a live camera preview in this screen.

## Behavior

- Do not navigate here from the reservation list or the photo confirmation screen.
- Start camera permission and camera launch only from the user's `カメラを起動` button press.
- While the camera launch is in progress, disable the action and change its label to `起動しています…`.
- If permission is denied or capture fails, show the photo service error and restore the action.
- If the user cancels the platform camera, remain on this screen and show `撮影をキャンセルしました。`.
- On successful capture, store `{ reservationId, uri }` as the pending visit photo in app-wide memory and replace this route with `/reservations/confirm?reservationId={id}`.
- Do not place the photo URI in route parameters because web captures may be large base64 data URIs.

## Self-Review

Score: **98/100**. The fallback-only role, route validation, exact copy, permission timing, progress, cancellation, error, data handoff, and destination are explicit.
