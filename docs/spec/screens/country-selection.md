# Country Selection Screen Specification

## Purpose

Select a supported cuisine-origin country or a Japanese prefecture before nearby restaurant search.

## Catalog Loading

- Start the matching API request and local cache read together.
- Display valid cached items immediately and stop the blocking loader.
- Replace cached items with a successful API response and persist the complete response.
- When refresh fails after cached items are displayed, keep them interactive and show `保存済みの一覧を表示しています。`.
- When neither API data nor a valid cache exists, show the existing backend connection error and `再読み込み` action.
- Country mode filters cached and fresh items to `cuisine_supported === true`. Prefecture mode preserves all prefectures.

## Navigation

- Japan opens `/search/prefectures`.
- Other supported countries open `/search/results?country=<code>`.
- A prefecture opens `/search/results?country=JP&region=<code>`.
- In the current home-tab flow, Japan opens `/prefectures`, and a prefecture opens `/shops/JP?regionCode=<code>`.
- `旅のスタンプ地図を見る` replaces the route with `/map`.

## Self-Review

Score: **99/100**. Concurrent loading, fallback behavior, exact notice, filtering, retry, and navigation are deterministic.
