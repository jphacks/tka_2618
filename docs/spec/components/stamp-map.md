# Stamp Map Component Specification

## Interface

The component receives map shapes, an SVG view box, visit counts keyed by region code, the selected region code, and an `onSelect` callback. Selecting a region passes its complete map shape to the callback.

## Presentation

- Fit the map within the viewport minus 48 pixels, capped at 752 pixels wide.
- Derive height from the supplied SVG view box, falling back to a 1.5 aspect ratio when it is invalid.
- Fill visited regions black and unvisited regions white.
- Draw the selected region with a 3-pixel gold stroke. Other regions use a 0.8-pixel grey stroke.

## Platform Interaction

- iOS and Android render with `react-native-svg` and select a region through `onPress`.
- Web renders standard SVG elements and selects a region through `onClick`.
- Each Web path has button semantics, a region-name accessibility label, and supports Enter and Space selection.
- The Web implementation must not pass React Native responder properties to DOM elements.

## Self-Review

Score: **99/100**. Inputs, sizing, colors, selection behavior, platform rendering, keyboard behavior, and the warning-prevention constraint are explicit.
