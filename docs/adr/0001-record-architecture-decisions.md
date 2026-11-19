# 1. Record architecture decisions

Date: 2026-11-19
Status: Accepted

## Context

Product requirements live in Linear (the "Product spec" document of the On-call Copilot project), where product and design can edit them. Technical decisions need a home that is versioned with the code and reviewed in pull requests.

## Decision

Record architecture decisions as short ADRs in `docs/adr/`, numbered sequentially, using the sections Context, Decision, Consequences. Link to the Linear spec or issue an ADR responds to.

## Consequences

- Reviewers and coding agents can find the reasoning behind the code in the repo.
- ADRs are changed through PRs, so they get the same review and CI as code.
- Product requirements are not duplicated here; ADRs link to them instead.
