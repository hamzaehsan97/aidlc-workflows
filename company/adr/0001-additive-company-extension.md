# ADR 0001: Keep company practices outside the upstream lifecycle engine

Status: proposed; acceptance is the maintainer's merge decision on this extension.
Date: 2026-11-01. Owner: company engineering lead (to be assigned).

## Context

A small team will share engineering practices across multiple B2B SaaS products
and a separate platform repo. The AWS upstream already supports owned plugins,
additive stage contributions and team knowledge. Forking its orchestrator would
make routine upstream updates a competing engineering project.

## Decision

Own `company/` and `plugins/company-saas/`, plus narrowly named company CI files.
Use supported additive contributions to existing stages and shared knowledge.
Distribute portable skills and templates with a pinned, conflict-aware bootstrap.
Keep application runtime contracts in the platform repo, referenced by the shared
architecture guide. Record engine and company source commits separately.

Do not add stages, scopes, guard code or generated runtime edits for this baseline.
Do not claim knowledge or stage prose enforces infrastructure access controls.

## Alternatives

- Modify core stages/orchestrator: simpler initial editing, recurring merge and
  lifecycle drift; rejected without a demonstrated upstream gap.
- Standalone company plugin repository now: clean ownership, but adds release and
  distribution overhead before the first consumer; defer until two consumers.
- Documentation only: lowest maintenance, but practices are easy to miss during
  stage execution and bootstrap must be repeated manually; use additive fragments.

## Consequences and revisit

Upstream owns engine behavior; company owns content and consumer adoption. Stage
anchor changes can break composition, so build/test against each candidate update.
Skills use separate host discovery because plugin `contributes.skills` and
`contributes.memory` are not supported by this upstream revision. Host live smoke
and infrastructure gate verification remain rollout prerequisites. Revisit after
product two or a demonstrated need for a new lifecycle capability.
