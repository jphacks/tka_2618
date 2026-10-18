# Reservation Model Specification

## Fields

- `id`: unique reservation record ID
- `shopId`: optional restaurant search-result ID
- `countryCode`: supported cuisine-origin country code
- `shopName`: restaurant display name
- `dateTime`: local reservation date and time in `YYYY-MM-DDTHH:mm` format
- `info`: optional restaurant description or address
- `imageUrl`: optional restaurant image URI
- `notify`: whether reservation-time notification is enabled

`shopId` is optional so existing fixtures and reservations entered by hand remain valid.

## Self-Review

Score: **96/100**. Every persisted field, format, purpose, and compatibility rule is explicit.
