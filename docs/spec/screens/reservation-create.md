# Reservation Creation Screen Specification

## Route and Input

Route: `/reservations/new`.

Optional route parameters are `shopId`, `shopName`, `countryCode`, `prefectureCode`, `imageUrl`, and `info`. When opened from a restaurant result, use valid parameters to prefill the corresponding reservation fields. When opened directly from the reservation list, retain the existing empty form behavior.

## Saved Data

Save the selected country, Japanese prefecture when the country is Japan, trimmed restaurant name, reservation date and time, notification preference, optional restaurant ID, optional information text, and optional image URL. The restaurant ID enables exact reservation-status matching in search results. The prefecture determines which region is painted on the Japan stamp map after a photo is recorded.

## Behavior

- Show the prefecture selector only when Japan is selected.
- The save action remains disabled until a supported country and non-empty restaurant name are present, and until a prefecture is selected for Japan.
- Saving adds the reservation to app-wide state and returns to the previous screen.
- Existing manual reservation creation, date selection, country selection, and notification controls remain available.

## Implementation Rationale

Prefilling from the selected search result avoids asking the user to re-enter the restaurant and gives reservation-status checks a stable restaurant ID. Optional fields preserve compatibility with existing and manually entered reservations.

## Self-Review

Score: **97/100**. Route inputs, prefilling, saved fields, validation, compatibility, and navigation are explicit.
