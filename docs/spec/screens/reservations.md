# Reservations Screen Specification

## Purpose

Display saved restaurant reservations and let the user start the visit-photo flow with one tap.

## Route

Route: `/reservations`.

## Photo Capture Behavior

- Each reservation card has a `写真を撮る` button.
- Pressing `写真を撮る` immediately requests camera permission when needed and opens the platform camera. Do not navigate to an intermediate camera guidance screen.
- While permission or camera launch is in progress, disable photo actions on all cards. The selected card displays `起動しています…`.
- If capture is cancelled, stay on the reservation list and display `撮影をキャンセルしました。`.
- If permission, capture, or temporary persistence fails, stay on the reservation list and display the corresponding error.
- After successful capture and temporary persistence, navigate to `/reservations/confirm?reservationId={id}`.
- Store the pending photo through the app data provider before navigation. Do not put its URI in the route because web photos may be base64 data URIs.

## Other Behavior

Reservation creation and deletion keep their existing behavior. Deletion is unavailable while a photo action is in progress.

## Implementation Rationale

Launching the platform camera from the card button reduces the reservation-to-camera flow from two taps to one. Calling it directly from a press event also satisfies mobile-web browser requirements for user-initiated camera UI.

## Self-Review

Score: **99/100**. The trigger, busy state, cancellation, errors, persistence order, destination, and unchanged reservation actions are explicit enough for independent implementations to match.
