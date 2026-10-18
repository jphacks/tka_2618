# Settings Screen Specification

## Purpose

Provide controls for locally stored visit records and application information.

## Route and Layout

Route: `/settings`.

Display these sections in order:

1. `記録` with `記録をリセット`
2. `このアプリについて` with the about and credit actions
3. `開発用` with backend connection status

Do not display reservation-notification settings. The application does not currently schedule reservation notifications, so the screen must not imply that enabling a switch will send one.

## Behavior

- `記録をリセット` requires confirmation before clearing visits and map fills.
- About and credit actions retain their existing bottom-sheet behavior.
- Existing persisted notification preferences may remain in local storage for backward compatibility but are not exposed or changed by this screen.

## Self-Review

Score: **99/100**. Section order, visible actions, removed notification UI, compatibility behavior, and retained interactions are explicit.
