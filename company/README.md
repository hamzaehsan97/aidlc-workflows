# Company AIDLC extension

A proposed operating baseline for Hamza's small multi-product B2B SaaS team.
The company name, first product, stack, hosting and tracker are not yet selected.
GitHub Issues/Projects is the default tracker proposal. No private business data
belongs in this public fork.

## Start here

1. Review [the design and milestones](design.md) and [the file inventory](files.md).
2. Follow [bootstrap and upgrade instructions](bootstrap/README.md) in a disposable
   project, then use one product repo as the pilot.
3. Read [the plugin installation instructions](../plugins/company-saas/README.md).
4. Adopt practices through a reviewed PR and the existing practices-discovery flow.
   Connect your tracker and enforce production controls separately.

The plugin enriches six existing stages. It adds no lifecycle engine, stage,
agent or scope. The bootstrap copies a versioned policy/template snapshot and
three portable skills into a target repo. It never connects MCP servers, installs
credentials, creates GitHub settings or deploys applications. Re-running is a
no-op for matching content and refuses conflicting content before writing.

## Ownership

This repo: engineering practice, reusable AI capabilities, bootstrap, process ADRs.
`core-platform`: identity, tenants, billing/entitlements and shared gateway contracts.
Product repos: domain behavior, storage, product validation evidence and releases.
Start with one customer journey; grow shared services when actual consumers need them.
