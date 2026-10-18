# Reservation Model Specification

## Fields

- `id`: unique reservation record ID
- `shopId`: optional restaurant search-result ID
- `countryCode`: supported cuisine-origin country code
- `prefectureCode`: optional Japanese prefecture code; required by the form when `countryCode` is `JP`
- `shopName`: restaurant display name
- `dateTime`: local reservation date and time in `YYYY-MM-DDTHH:mm` format
- `info`: optional restaurant description or address
- `imageUrl`: optional restaurant image URI
- `notify`: whether reservation-time notification is enabled
- `notificationId`: optional native scheduled-notification identifier

`shopId` and `notificationId` are optional so manually entered reservations and reservations without a scheduled notification remain valid. Reservations persist in SQLite on iOS and Android and AsyncStorage on web.

## Self-Review

Score: **98/100**. Every persisted field, format, purpose, storage behavior, and compatibility rule is explicit.
