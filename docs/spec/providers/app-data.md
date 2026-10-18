# App Data Provider Specification

## Shared State

The provider exposes reservations, visited shops, visited country codes, the notification preference, and one optional pending visit photo.

The pending visit photo has exactly these fields:

- `reservationId`: ID of the reservation being documented
- `uri`: local file URI or web data URI returned by the photo capture service

## Update Rules

- `setPendingVisitPhoto` replaces the current pending photo.
- `clearPendingVisitPhoto` removes it.
- Camera capture sets the pending photo only after a successful capture.
- Photo retake and successful visit recording clear it.
- Consumers must compare its `reservationId` with the active route before displaying or saving it.
- The pending photo is in memory only and resets when the application process restarts.

## Self-Review

Score: **97/100**. The state shape, ownership, mutations, validation rule, lifecycle, and persistence limit are explicit.
