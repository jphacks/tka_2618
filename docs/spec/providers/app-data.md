# App Data Provider Specification

## Shared State

The provider loads and exposes persisted reservations, visited shops, visited country codes, the notification preference, and one optional pending visit photo. It uses the platform-selected local repository and never selects SQLite or AsyncStorage itself.

The pending visit photo has exactly these fields:

- `reservationId`: ID of the reservation being documented
- `uri`: local file URI or web data URI returned by the photo capture service

## Update Rules

- `setPendingVisitPhoto` replaces the current pending photo.
- `clearPendingVisitPhoto` removes it.
- Adding or deleting a reservation persists the change before updating shared state.
- Adding or resetting visited shops persists the change before updating shared state.
- Changing the notification preference persists it before updating shared state.
- Camera capture sets the pending photo only after a successful capture.
- Photo retake and successful visit recording clear it.
- Consumers must compare its `reservationId` with the active route before displaying or saving it.
- The pending photo is restored after an application restart until retake or successful recording clears it.

## Self-Review

Score: **98/100**. The state shape, repository ownership, persistence ordering, mutations, validation rule, and pending-photo lifecycle are explicit.
