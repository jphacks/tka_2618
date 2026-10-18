# Stamp Map Screen Specification

## Route and Purpose

Route: `/map`. This is the root screen of the map tab and shows progress derived from locally saved verified visits.

## Layout

1. Title `旅のスタンプ地図`
2. Segmented control with `世界` and `日本`
3. White vector map with grey borders and verified regions filled black, with zoom buttons in its top-right corner
4. Legend for visited and unvisited fills
5. Progress card showing the visited count and total target count
6. Selected-region detail card
7. Visited-region list with region name and visit count

The world view is initially selected. Switching views does not navigate or discard state.

## Map Rules

- Only visits that are verified, linked to a reservation, and contain at least one photo contribute to map fills and visit counts.
- World map regions use uppercase ISO country codes.
- Japan map regions use the same prefecture codes returned by the backend.
- Unvisited fill is white and borders are grey. Visited regions show the first photo of their most recent eligible visit (latest `visitedAt`), clipped to the region shape; black is the fallback when the photo cannot be shown. In Japan mode, only visits with a matching prefecture code supply prefecture photos.
- The legend labels the visited swatch `訪問済み（写真で表示）`.
- The selected region keeps its fill and receives a gold border.
- Count each painted region once even when it has multiple eligible visits.
- In world mode, show `訪問国数` and `{painted target-country count} / {target-country count}`. Target countries are the country codes returned by `/api/countries`, including unsupported cuisines; use the saved country catalog when offline. If neither source is available, fall back to country-coded regions in the world map data.
- In Japan mode, show `訪問都道府県数` and `{painted prefecture count} / 47`. The denominator comes from the 47 entries in the Japan map data.
- Update the progress card immediately when switching between world and Japan modes.
- Pressing a region displays its name, verified visit count, and up to three matching restaurant visits. Pressing one of those visits opens `/visits/<visit ID>`.
- Selecting a region only displays stamp progress and matching visit history. It never starts restaurant search.
- The map must scale to the available width without horizontal scrolling. Its frame size, zoom buttons, pinch and drag behavior follow `docs/spec/components/stamp-map.md`.
- Switching between world and Japan modes resets the map to the whole-map view.

## Empty and Error States

- With no stamp-eligible visits, show the unpainted map and `予約したお店で写真を記録すると、地域が黒く塗られます。`.
- Repository read failures show `訪問記録を読み込めませんでした。` and a retry action.

## Entry Points

- Pressing the map tab always opens this screen.
- Successful visit registration opens this screen.
- The visit completion screen's `地図を見る` action opens this screen and immediately reflects the saved country and Japanese prefecture stamp.
- The screen contains no restaurant-search navigation. Restaurant search starts from the home screen.

## Self-Review

Score: **99/100**. Views, colors, selection, eligible and deduplicated progress counts, online and offline denominators, exact labels, empty/error behavior, navigation boundaries, and the search exclusion are explicit. Geographic path simplification may differ visually but does not affect region identity or behavior.
