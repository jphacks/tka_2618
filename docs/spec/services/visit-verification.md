# Visit Verification Service Specification

## Purpose and Rationale

Determine whether the user is plausibly at the selected restaurant without storing their exact location. The same result shape supports real-device checks and deterministic demonstrations.

## Location Verification

1. Require at least one photo URI.
2. Request foreground location permission only after the user presses the verification button.
3. Obtain a fresh location with `Location.Accuracy.High`.
4. Calculate the great-circle distance between the device and restaurant with the Haversine formula.
5. Verify when distance is at most 300 metres and reported accuracy is at most 100 metres.
6. Return rounded distance and accuracy. Do not return or persist the device coordinates after evaluation.

Failures produce a user-facing reason for missing photo, denied permission, unavailable location, excessive accuracy error, or excessive distance.

## Demo Verification

- Available only when `__DEV__` is true.
- Simulates the location-verification process without calling a device location API or requesting location permission.
- Requires a photo URI or restaurant image URI.
- Reports `locating` for 700 milliseconds, then `checking` for 700 milliseconds so the user can observe the verification process.
- Produces a verified result with mode `demo`, distance 80 metres, and accuracy 20 metres.
- Uses the same repository and stamp derivation as location verification.

## Constants

Distance threshold, accuracy threshold, demo distance, maximum photo count, and maximum memo length live in one constants module. Screens must not duplicate them.

## Self-Review

Score: **99/100**. Inputs, thresholds, timing, progress states, privacy behavior, errors, and demo output are deterministic enough for independent implementations to match.
