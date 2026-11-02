# Shared engineering standards

Status: proposed company baseline. Adopt through a reviewed repository change;
use practices-discovery to affirm applicable rules in the active space's
`memory/team.md`. This knowledge document does not lock engine guard settings.

## Ownership and delivery

Start with one product and a small core platform. Prefer a modular application
per repo and managed services; require an ADR before adding a separately deployed
service, shared database, new infrastructure provider, or bespoke identity system.
One engineer may hold several roles, but every product has a named product owner,
engineering owner and production operator. The company name and stack remain open.

Use short-lived branches and reviewable PRs linked to a work item. Keep acceptance
criteria, tests, contract changes, rollout and rollback evidence together. A
reviewer other than the author approves production-bound changes. AI review is
assistance, not the human review. Exceptions name an owner, reason, compensating
control and expiry; they do not silently weaken other repositories.

## Tenancy and security

Resolve tenant membership server-side from verified identity. A caller-supplied
tenant ID is a selector, never proof of access. Enforce authorization on every
request and background job, including exports, support access and object storage.
Test two tenants with overlapping object identifiers, revoked memberships and
cross-tenant cache keys. Logs include request/correlation identifiers but redact
credentials and sensitive customer fields. Secrets come from a secret manager;
never store customer data, tokens or production dumps in prompts or this public repo.

Separate development, staging and production identities and data. Give each
product access only to its own resources. Encrypt data in transit and at rest,
record retention/deletion behavior, and audit privileged actions. A regulated
product needs its own reviewed requirements before handling regulated data; this
baseline makes no compliance certification claim.

## Code and verification

Choose the language/framework once the first product's requirements are known;
record package manager, lockfile and pinned runtime in that repo. Run formatting,
static analysis, type checks where available, unit tests for domain rules,
integration tests for storage/auth/queues, and consumer contract tests at platform
boundaries. Require negative authorization tests for tenant-sensitive changes.
Exercise the smallest meaningful end-to-end customer journey on staging.

Treat database changes as expand/migrate/contract. Make jobs idempotent, cap retries,
use backoff, and bound timeouts. Set explicit reliability/cost targets per product
instead of inventing a company-wide uptime promise. Name alert owners, restoration
targets and a tested rollback or roll-forward path before production.

## Decisions and documentation

Keep product evidence and ADRs in the owning private product repo. Use ADRs for
costly-to-reverse choices: tenancy, identity, billing authority, data boundaries,
contract changes and deployment shape. Record alternatives, consequences and a
revisit trigger. Proposed decisions are not accepted until their named owner agrees.
The shared extension contains reusable practices, not private strategy or secrets.
