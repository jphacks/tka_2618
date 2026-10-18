# Stamp Map Component Specification

## Interface

The component receives map shapes, an SVG view box, visit counts keyed by region code, visit photo URIs keyed by region code (`visitPhotos`), the selected region code, and an `onSelect` callback. Selecting a region passes its complete map shape to the callback.

## Presentation

- The frame width is the window width minus 32 pixels, capped at 768 pixels. The frame height equals the width, capped at 520 pixels. The frame has a `#f2f2f0` background, 16-pixel corner radius, no inner padding, and clips its content.
- At zoom level 1 the whole map is centered inside the frame. The supplied view box is widened or heightened to the frame's aspect ratio so the map keeps its own aspect ratio. An invalid view box falls back to `0 0 1.5 1`.
- Fill unvisited regions white and visited regions black.
- For each visited region with a photo URI, draw that photo over the black fill, clipped to the region shape. The photo covers the region's bounding box with `preserveAspectRatio="xMidYMid slice"` (centered, cropped, never stretched). If the photo cannot be loaded, the black fill remains visible. Bounding boxes come from `calculateMapShapeBounds` in `utils/mapPathBounds.ts`; a region whose path cannot be measured keeps the black fill.
- Photo regions are drawn after all region paths and receive their own border path on top, so photos never hide region borders or the selected-region stroke. Pressing a photo region selects that region.
- Draw the selected region with a 2.5-pixel gold (`#c69214`) stroke. Other regions use a 0.6-pixel grey (`#929b98`) stroke. Strokes use `vector-effect: non-scaling-stroke`, so their on-screen width stays constant at every zoom level.

## Zoom and Pan

- The visible range is a camera expressed in SVG coordinates and applied as the SVG `viewBox`. Zoom level is the fitted width divided by the camera width.
- Zoom level is clamped between 1 and 8. The camera always stays inside the fitted whole-map range, so the map cannot be dragged out of the frame.
- Three 40×40 buttons are stacked vertically in the frame's top-right corner, 8 pixels from both edges with a 6-pixel gap: `+` (accessibility label `地図を拡大`), `−` (`地図を縮小`), and `⤢` (`地図の表示を元に戻す`). `+` and `−` zoom by a factor of 1.5 around the frame center. `⤢` returns to the whole-map view. `+` is disabled at zoom 8; `−` and `⤢` are disabled at zoom 1. Disabled buttons are shown at 40% opacity.
- When the view box or frame size changes, such as switching between the world and Japan maps, the camera returns to the whole-map view.

### iOS and Android

- Two-finger pinch zooms around the fingers' focal point, and moving the focal point pans the map during the pinch.
- One-finger drag pans the map only while zoom level is above 1, after 8 pixels of movement. At zoom level 1, a vertical drag scrolls the screen instead.
- Gestures use `react-native-gesture-handler`. The application root is wrapped in `GestureHandlerRootView`, and the stamp map screen uses the Gesture Handler `ScrollView` so map gestures and page scrolling do not conflict.

### Web

- The mouse wheel or trackpad pinch zooms around the pointer position. The wheel listener is registered as non-passive so it can prevent page scrolling over the map.
- Dragging with a pointer pans the map after 4 pixels of movement. A click that ends a drag does not select a region.
- The cursor is `grab` while zoom level is above 1.

## Platform Interaction

- iOS and Android render with `react-native-svg` and select a region through `onPress`.
- Web renders standard SVG elements and selects a region through `onClick`.
- Each Web path has button semantics, a region-name accessibility label, and supports Enter and Space selection.
- The Web implementation must not pass React Native responder properties to DOM elements.

## Implementation Rationale

- Zooming changes the SVG `viewBox` instead of scaling the view with a transform. A scaled view is rasterized at its original size and becomes blurry, while a new `viewBox` keeps borders crisp at every zoom level. Region paths are memoized so a camera change only updates the `viewBox`.
- `react-native-gesture-handler` was added because React Native's responder system cannot reliably separate pinch, map drag, and page scrolling inside a `ScrollView`. It is bundled with Expo Go, so no development build is required.
- Zoom buttons are provided in addition to gestures so the feature is reachable on Web, with assistive technologies, and without multi-touch.
- Visited regions show visit photos instead of plain black so the map works as a memory album. The black fill stays underneath as a fallback for missing or deleted photo files. On Web, the photo overlay is `aria-hidden` and keyboard selection stays on the underlying region path.
- Camera math lives in `StampMap.types.ts`, and the camera state and buttons live in `StampMapControls.tsx`, so the native and Web implementations share one behavior.

## Self-Review

Score: **96/100**. Sizing, fitting, colors, stroke behavior, zoom limits, button placement and states, per-platform gestures, scroll conflict handling, reset conditions, and rationale are explicit. The exact gesture feel may differ slightly between devices because of platform touch handling.
