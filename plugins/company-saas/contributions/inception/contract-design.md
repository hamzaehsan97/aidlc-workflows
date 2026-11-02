---
target: contract-design
plugin: company-saas
fragments:
  - anchor: before-step:4
    order: 100
---

## fragment: before-step:4

### Company SaaS guidance

Read `{{HARNESS_DIR}}/knowledge/aidlc-shared/company-saas-platform-interfaces.md`.
Use the proposed ownership boundary when designing platform/product contracts. Carry tenant authorization, failure behavior, versioning, idempotency and consumer tests into the existing contract summary; record costly-to-reverse choices as proposed ADRs in the owning repo.
