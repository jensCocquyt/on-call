# Agent instructions

These rules apply to any coding agent working in this repo (Linear cloud coding agent, Claude Code, others).

## Sources of truth

- **Product requirements:** the "Product spec" document in the Linear project "On-call Copilot". Each Linear issue copies the requirements it needs; if the issue and the spec disagree, stop and flag it.
- **Technical decisions:** `docs/adr/` in this repo. Add an ADR for any decision a reviewer would ask "why?" about.

## Workflow

1. Work on one Linear issue per branch and PR. Use the branch name Linear suggests (it contains the issue ID).
2. Keep changes inside the issue's scope. Do not change behaviour listed as out of scope.
3. Run `npm run check` (lint, typecheck, tests) before opening the PR. All of it must pass.
4. Add or update tests for every behaviour change.
5. Update README or `docs/` in the same PR when behaviour, setup or architecture changes.
6. Open the PR using `.github/pull_request_template.md`, with `Fixes <ISSUE-ID>` in the body.
7. Review your own diff before marking the PR ready: remove debug code, unused files and unrelated changes.

## When a requirement looks wrong

Do not silently change product behaviour. Implement what the issue says if possible, and add a "Proposed spec change" section to the PR body: current text, proposed text, reason. A human updates the Linear spec and affected issues once agreed.

## Commands

| Task | Command |
| --- | --- |
| Install | `npm ci` |
| All checks | `npm run check` |
| Tests only | `npm test` |
| Lint only | `npm run lint` |
| Typecheck only | `npm run typecheck` |

## Conventions

- Node 22, TypeScript strict mode, ES modules.
- No secrets in the repo, in logs, or in model prompts. Use `.env` (gitignored) locally.
