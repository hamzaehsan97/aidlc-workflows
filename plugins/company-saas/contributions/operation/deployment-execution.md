---
target: deployment-execution
plugin: company-saas
fragments:
  - anchor: before-step:2
    order: 100
---

## fragment: before-step:2

### Company SaaS guidance

Read `{{HARNESS_DIR}}/knowledge/aidlc-shared/company-saas-production-gates.md`.
Check candidate-specific release evidence and externally enforced environment/IAM controls before deploying. Follow the existing human decision flow. Do not treat a chat approval or skipped stage as infrastructure authority; name any missing control and the responsible operator.
