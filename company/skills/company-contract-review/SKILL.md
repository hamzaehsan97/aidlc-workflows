---
name: company-contract-review
description: Design or review a product-to-core-platform interface, including tenancy, compatibility and failure behavior.
---

Read `.company-aidlc/knowledge/company-saas-platform-interfaces.md` from the target repository
root. If the snapshot is not installed, read the equivalent
`plugins/company-saas/knowledge/aidlc-shared/company-saas-platform-interfaces.md` from this
extension checkout. If neither is available, report the missing guide before using
company-specific assumptions.

Read both producer and consumer contracts when available. Review authorization, tenant boundaries, entitlement staleness, webhook replay, retries and version migration. Report specific findings with affected consumers and tests; use the ADR template for unresolved durable choices. Do not invent an existing service or change a contract unasked.

Templates are in `.company-aidlc/templates/` after bootstrap or `company/templates/`
in the source checkout. Keep sensitive evidence in the owning private repository.
