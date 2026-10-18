# Expo SDK 54 Demo Compatibility Specification

## Purpose and Rationale

Provide a branch that can be opened by the Expo Go build currently installed on the demonstration iPhone. Keep the SDK 57 implementation on its existing branch so the compatibility change can be reviewed, tested, or discarded independently.

## Dependency Contract

1. The `expo` dependency must resolve to Expo SDK 54.
2. React must resolve to the SDK 54 supported React 19.1 release.
3. React Native must resolve to the SDK 54 supported React Native 0.81 release.
4. Expo modules, Expo Router, React Native Maps, Reanimated, Safe Area Context, Screens, SVG, Web, Worklets, TypeScript types, and Expo ESLint configuration must use the versions selected by `npx expo install --fix` for SDK 54.
5. Existing security patches must remain enabled during installation, development startup, and CI checks.
6. The app configuration must not declare a conflicting `sdkVersion` value.

## Functional Compatibility

The SDK 54 branch must preserve the existing user flows:

- restaurant search from the home screen;
- country and prefecture selection;
- full-screen restaurant and stamp maps;
- reservation recording;
- foreground location verification;
- camera or photo-library visit evidence;
- country and prefecture stamp-map painting after a verified visit.

Compatibility changes may alter implementation details only when an SDK 57 API is unavailable in SDK 54. User-visible behavior and persisted data contracts must remain unchanged.

## Acceptance Criteria

1. `npx expo-doctor@latest` reports no dependency-version errors.
2. Type checking and linting complete successfully.
3. Security patch verification and security tests complete successfully.
4. Expo can export Android, iOS, and web bundles without resolution errors.
5. `npx expo start --lan` displays an Expo Go QR code and reports SDK 54 in the public app configuration.
6. The physical iPhone can open the project without the Expo Go SDK incompatibility screen.

## Self-Review

Score: **97/100**. The target SDK, dependency alignment mechanism, preserved behavior, isolation strategy, and executable acceptance checks are explicit. The final device check depends on the Expo Go build installed on the demonstration iPhone.
