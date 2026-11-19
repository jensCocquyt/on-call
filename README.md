# On-call Copilot

A proof of concept for [A2UI](https://a2ui.org): an agent that answers an alert with interactive UI (incident card, metric chart, likely causes, confirm-before-acting form) instead of text. All infrastructure is simulated.

Status: project skeleton. Features are tracked in Linear.

## Requirements

- Node 22 (see `.nvmrc`)

## Getting started

```sh
npm ci
npm run check   # lint, typecheck, tests
```

## How work flows

1. Product requirements live in the Linear project's **Product spec** document.
2. They are broken into small Linear issues, each self-contained.
3. A coding agent (or a human) implements one issue per PR, following [AGENTS.md](AGENTS.md).
4. CI (`check`) and a human review gate the merge into `main`.
5. Merging a PR with `Fixes <ISSUE-ID>` moves the Linear issue to Done.

Technical decisions are recorded in [docs/adr](docs/adr).
