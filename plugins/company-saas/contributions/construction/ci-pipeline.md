---
target: ci-pipeline
plugin: company-saas
fragments:
  - anchor: before-step:4
    order: 100
---

## fragment: before-step:4

### Company SaaS guidance

Read `{{HARNESS_DIR}}/knowledge/aidlc-shared/company-saas-production-gates.md`.
Translate applicable gates into the owning application's CI/deployment design. Name the enforcing system, account-plan prerequisites and negative acceptance test for each. Report guidance-only controls as unimplemented; do not infer enforcement from a checklist.
