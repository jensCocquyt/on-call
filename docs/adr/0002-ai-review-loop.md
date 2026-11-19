# 2. AI review with an automatic fix loop

Date: 2026-11-19
Status: Accepted

## Context

This is a solo project. Pull requests opened by the Linear coding agent are authored by the maintainer's GitHub account, so the maintainer cannot give a counting approval. We still want every PR reviewed before merge, and we want routine review feedback handled without manual relaying.

## Decision

- **Reviewer:** the Claude Code GitHub Action (`.github/workflows/claude-code-review.yml`) runs the `code-review` plugin on every non-draft PR and on every new push. It posts inline comments as the Claude GitHub App. It never approves or blocks.
- **Fixer:** a Linear Loop triggered by "review submitted" on this repository starts a coding session that addresses each review comment: fix and reply, or reply with a reason not to. It stops after 3 fix rounds per PR and asks the maintainer.
- **Gate:** the `main` ruleset requires the `check` status and resolved conversations. The maintainer reviews and merges; AI review is feedback only.

## Consequences

- Each push re-runs the reviewer, so review and fix alternate until there are no new comments or the round limit is hit.
- Costs: reviewer runs on the maintainer's Claude subscription (`CLAUDE_CODE_OAUTH_TOKEN`) plus GitHub Actions minutes; fix rounds use Linear AI credits.
- Fork PRs get no AI review (secrets are not exposed to forks).
