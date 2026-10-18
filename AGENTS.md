# Project Instructions

This document defines the project's rules, objectives, and progress management methods. Proceed with the project according to the following content.

## Common Guidelines

- Think exclusively in English. Respond to the user in Japanese.
- Practice Specification-Driven Development (SDD). First, work with the user to write accurate specifications, and then implement them.
- Before implementation, explain in Japanese why the change is needed and why the selected approach satisfies the specification. Record material architectural and implementation rationale in the relevant specification document so future contributors can understand the decision.
- To maximize efficiency, execute independent tool operations concurrently rather than sequentially.
- When learning how to use a library, always use the Context7 MCP to retrieve the latest information.
- Before executing an instruction, read `docs/structure.md` to identify the files that should be changed. Do not scan the contents of every file.
- Never read, print, search, copy, or otherwise inspect `.env` files or their contents. Use committed `.env.example` files to understand required variable names and formats. Commands may load environment variables at runtime, but their values must never be displayed or written to logs, source files, specifications, or responses.

## Programming Rules

- Avoid hard-coding values unless absolutely necessary.
- Do not use `any` or `unknown` types in TypeScript.
- Do not use a TypeScript `class` unless absolutely necessary, such as extending `Error` for custom error handling that requires `instanceof` checks.
- Always reuse existing components when available. Do not duplicate similar logic or functionality.

## How to Write Specifications

Follow these rules whenever you are instructed to create a specification document.

1. **Self-review requirement:** Perform a self-review after completing the specification document.
2. **Scoring and revision:** Give the specification a score out of 100. If the score is below 90, revise and review it again.
3. **Core review criterion:** Ask: "If this specification were given to 10 different people, would all 10 of them build the exact same thing?"
4. **Prioritize reproducibility:** Specify details such as button placement, consistent design application, business logic, states, and edge cases precisely.
5. **Component reuse:** Identify and reuse existing components before defining new ones.
6. **Clarification:** If a material requirement remains unclear and would change the implementation, ask questions until it is resolved.
7. **Implementation rationale:** Explain why the feature or change is needed, why the selected approach was chosen, and which alternatives or trade-offs materially affected the decision.

## Specification Directory Structure

```text
docs/
├── structure.md
└── spec/
    ├── components/
    ├── screens/
    ├── models/
    ├── services/
    ├── themes/
    ├── repositories/
    └── providers/
```

### `structure.md`

Document the directory structure of the entire project, not only the `docs` directory. Limit the diagram to approximately four hierarchy levels.

### `components`

Store one specification per reusable UI component. Each specification must describe:

- Component interface, including props and events
- Visual design and behavior
- States and interactions
- Usage examples and constraints

### `screens`

Store one specification per screen. If the URL does not change, represent the UI as a component instead. Each screen specification must describe:

- Screen layout and UI structure
- User interactions and navigation flow
- Data requirements and state management
- Error handling and edge cases

### `models`

Document:

- Entity relationships and structure
- Data validation rules
- Type definitions and interfaces
- Database schema, when applicable

### `services`

Document business logic and external service integrations, including:

- API endpoints and data contracts
- Service methods and responsibilities
- Error handling and retry logic
- Authentication and authorization requirements

### `themes`

Document:

- Color palette and typography
- Spacing and layout guidelines
- Component styling variants
- Responsive design breakpoints

### `repositories`

Document the data access layer, including:

- Data source abstractions
- CRUD operations and query methods
- Caching strategies
- Data synchronization logic

### `providers`

Document state management and context providers, including:

- Global state structure
- State update patterns
- Provider dependencies and initialization
- Performance considerations

## Coding Guidelines

TBD
