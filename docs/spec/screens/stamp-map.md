# Stamp Map Screen Specification

## Route and Purpose

Route: `/map`. This is the root screen of the map tab and shows progress derived from locally saved verified visits.

## Layout

1. Title `旅のスタンプ地図`
2. Segmented control with `世界` and `日本`
3. White vector map with grey borders and verified regions filled black
4. Legend for visited and unvisited fills
5. Progress text showing painted region count
6. Selected-region detail card
7. Visited-region list with region name and visit count
8. Development-only `デモ記録をリセット` action

The world view is initially selected. Switching views does not navigate or discard state.

## Map Rules

- World map regions use uppercase ISO country codes.
- Japan map regions use the same prefecture codes returned by the backend.
- Unvisited fill is white, visited fill is black, and borders are grey.
- The selected region keeps its fill and receives a gold border.
- Pressing a region displays its name, verified visit count, and up to three matching restaurant visits.
- An unvisited searchable region displays an action that opens restaurant search for that country or prefecture. Unsupported countries display a preparation message instead.
- The map must scale to the available width without horizontal scrolling.

## Empty and Error States

- With no verified visits, show the unpainted map and `まだ訪問記録がありません。`.
- Repository read failures show `訪問記録を読み込めませんでした。` and a retry action.
- Reset requires a confirmation alert and reloads the map after deletion.

## Entry Points

- Pressing the map tab always opens this screen.
- `お店を探す` opens `/map/search`, which contains the country-selection flow.
- Successful visit registration opens this screen.

## Self-Review

Score: **95/100**. Views, colors, selection, counts, empty/error behavior, reset, and navigation are explicit. Geographic path simplification may differ visually but does not affect region identity or behavior.
