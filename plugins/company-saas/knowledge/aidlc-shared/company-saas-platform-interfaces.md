# Interfaces to the separate core-platform repository

Status: proposed boundary, to accept in the platform ADR before implementation.
This AIDLC repository owns process, reusable skills and policy. It contains no
runtime platform service, customer database or application shared library.

| Capability | Owner | Product dependency |
| --- | --- | --- |
| Company landing page, signup/login and client gateway | core-platform | Link/deep-link and verified identity context |
| Organizations/tenants, memberships and invitations | core-platform | Tenant/membership API; never direct table access |
| Billing customers, subscriptions and entitlements | core-platform | Versioned entitlement API/events |
| Product catalog, access provisioning and navigation | core-platform | Product registration contract |
| Client support entry and shared employee access onboarding | core-platform, initially via integrations | Ticket reference and role-scoped access; separate employee/customer identities |
| Domain workflows, domain data and product UI | product repo | Its own API/storage; product team owns migrations |
| Cross-product operational audit/notifications | core-platform contracts, managed providers where useful | Minimal typed events; avoid a central data dump |

Use an established identity provider. Validate token signature, issuer, audience,
expiry and membership; define audience per service. Products enforce domain
permissions locally. Subscription claims alone do not authorize resource access.
Support impersonation, if ever needed, requires separate authorization, reason,
expiry and audit. Platform unavailability must not accidentally grant access.

## Minimum contracts for the first vertical slice

Platform owns canonical OpenAPI/AsyncAPI/schema files and published versions;
product repos pin generated clients or schemas and run consumer tests. Until those
exist, reference this proposed interface; do not invent deployed endpoints.

- Identity/tenant context: subject ID, tenant ID, roles/scopes, audience, expiry,
  correlation ID; server verifies every field's authority.
- Entitlement query: tenant ID, product key, feature key, allowance and decision
  version. Define bounded cache lifetime, revocation latency and unavailable
  behavior per risk. Fail closed on privileged operations; any permitted read-only
  degradation is an explicit ADR, not a blanket allow.
- Billing/entitlement event: event ID, type, schema version, occurred-at time,
  tenant ID, product key, aggregate version and minimal data. Verify webhook
  signatures/replay windows at ingress; deduplicate and handle out-of-order delivery.
- Product registration: stable key, display name, approved app URL, audience,
  required scopes and health endpoint. Validate redirects against an allowlist.
- Support reference: tenant, product, case ID and authorized deep link; sensitive
  attachments stay in the support system.

Each contract specifies provider and consumers, auth, tenant boundary, error
format, pagination, idempotency, timeouts, retry policy, rate limits, versioning,
deprecation window, data classification and failure behavior. Additive schema
changes still require compatibility tests; breaking changes use a new major
contract version with a migration window. Cross-repo PRs link both producer and
consumer changes and state deployment order and rollback compatibility.

No product reads platform tables or imports its server internals. Avoid distributed
transactions across repos: use idempotent workflows and compensation. Start with
contract fixtures and one real consumer, then extract a client package only when
reuse warrants it. Do not build all shared services before validating product one.
