# Demo Mode Provider Specification

## Purpose

Provide one session-wide flag that guarantees presentation flows do not request device location, camera access, or nearby-restaurant API data.

## State

- `enabled: boolean`
- Development builds start with `enabled === true`.
- Production builds always start with `enabled === false` and do not display the control.
- The value lasts for the current app session and is not persisted.

## Behavior

- The stamp-map screen displays a development-only switch and a visible `デモモード` notice while enabled.
- The country-selection screen displays only fixed demo restaurants while enabled and does not load country or prefecture data.
- A restaurant-results route opened while enabled must not request location permission or call `getCurrentPositionAsync`; it directs the user to the demo restaurant list.
- The visit-entry screen hides camera and real-location verification controls while enabled, uses the bundled sample image, and saves verification mode `demo`.
- Turning demo mode off restores the existing real search, camera, and location-verification behavior.

## Rationale

Central state prevents one screen from accidentally entering a real location flow during a presentation. Keeping the switch development-only prevents demo evidence from being created in production.

## Self-Review

Score: **98/100**. Defaults, visibility, affected screens, prohibited calls, restoration behavior, and persistence lifetime are explicit.
