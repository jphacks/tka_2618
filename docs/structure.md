# Project Structure

This file is the directory map to consult before deciding which files to inspect or modify. Keep it limited to the paths that explain ownership and responsibilities, at approximately four levels of depth.

```text
tka_2618/
├── AGENTS.md                    # Repository-wide Codex instructions
├── README.md                    # Setup, operation, and feature overview
├── compose.yaml                 # Local backend container configuration
├── backend/
│   ├── app/
│   │   ├── data/                # Country, prefecture, and cuisine data
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── locations.py         # Country and prefecture APIs
│   │   └── hotpepper.py         # Restaurant search integration
│   └── tests/                   # Backend API tests
├── mobile/
│   ├── AGENTS.md                # Expo and React Native-specific rules
│   ├── src/
│   │   ├── app/                 # Expo Router routes and layouts
│   │   ├── components/          # Reusable UI components
│   │   ├── constants/           # Theme and navigation constants
│   │   ├── data/                # Data types, API clients, and fixtures
│   │   ├── repositories/        # SQLite/native and AsyncStorage/web persistence
│   │   ├── providers/           # App-wide state providers
│   │   ├── services/            # Location verification and photo services
│   │   └── screens/             # Screen implementations
│   ├── assets/                  # App icons and static images
│   ├── scripts/                 # Dependency and security scripts
│   └── tests/                   # Mobile-side automated tests
└── docs/
    ├── structure.md             # This project map
    └── spec/                    # Specification documents by concern
        ├── components/
        ├── screens/
        ├── models/
        ├── services/
        ├── themes/
        ├── repositories/
        └── providers/
```

## Change Routing

| Change type | Start with |
|---|---|
| Repository setup or developer workflow | `README.md`, `compose.yaml` |
| Country or prefecture data | `backend/app/data/`, `backend/app/locations.py` |
| Restaurant search behavior | `backend/app/hotpepper.py`, `backend/tests/test_hotpepper.py` |
| Navigation or routes | `mobile/src/app/` |
| Screen behavior | `mobile/src/screens/` |
| Shared UI | `mobile/src/components/` |
| API client or frontend data types | `mobile/src/data/` |
| Local visit persistence | `mobile/src/repositories/` |
| App-wide state | `mobile/src/providers/` |
| Visit verification or photo capture | `mobile/src/services/` |
| Colors, spacing, or tab definitions | `mobile/src/constants/` |
| Specifications | The matching directory under `docs/spec/` |

Update this file whenever a structural change makes the map or routing table inaccurate.
