# Production gates and release evidence

These are company deployment requirements to implement in each application repo
and cloud account. This plugin supplies guidance, not access-control enforcement.
An AIDLC stage approval, Markdown checklist, local validator or tracker status
cannot prove an authorized deployment. Skipping a workflow stage does not grant
credentials or bypass infrastructure policy.

## Controls and acceptance tests

| Gate | Enforcement owner | Evidence and negative test |
| --- | --- | --- |
| Reviewed change | Protected default branch/ruleset, required independent review, required current-commit checks, no routine bypass | Unreviewed PR cannot merge; new commit invalidates stale review where configured |
| Tested candidate | CI with read-only default token, pinned actions, locked dependencies | Unit/integration, tenant isolation, contract compatibility, secret/dependency scans pass on candidate SHA; failed checks block merge |
| Approved release | Protected production environment or equivalent deploy-system control | Named release owner reviews exact immutable artifact digest + candidate SHA; unauthorized account cannot approve/deploy |
| Scoped runtime authority | Cloud IAM + environment-bound OIDC | Trust constrained to repository/environment; staging/PR identity cannot assume production role |
| Recoverable data change | Migration procedure + restore/rollback drill | Expand/migrate/contract evidence, backup restore test and measured recovery time |
| Healthy rollout | Deployment controller + health checks | Staging smoke, canary where useful, tenant journey, alerts, operator and automatic stop/rollback criteria |

Configure these controls before any production credential is exposed. On GitHub,
production jobs must reference the protected environment; an environment name in
YAML alone adds no review rule. Check the account plan and repository visibility:
required reviewers have availability limits, especially for private repositories.
If unavailable, use a deployment system with equivalent approval enforcement or
change the plan; do not label an unprotected workflow gated. Disable routine admin
bypass and prevent self-review where supported; retain a separately governed
break-glass procedure for emergencies. Never run untrusted PR code with production
secrets or use `pull_request_target` to execute an untrusted checkout.

## Release record

The release owner records product, environment, candidate commit, artifact digest,
contract versions, CI run URLs/results, reviewer and approval evidence, migration
plan, rollback/roll-forward procedure, restore test, staging smoke, monitoring,
on-call owner and deployment result. Bind approvals to the candidate; rebuilds or
changes require fresh evidence. Evidence comes from CI/deploy systems, not an
agent's claim that it ran. Retain it under the owning repo's access controls.

## First production rehearsal

Attempt an unreviewed merge, a failing-check merge, a deploy with a PR identity,
a staging-to-production role assumption, a stale candidate approval, a cross-tenant
request and a duplicate billing event. Record actual denials and recovery behavior.
Restore a backup to an isolated environment. For an emergency, an authorized human
uses break-glass with reason, expiry, audit and follow-up review; AI does not
self-authorize exceptions. With one operator, use an independently authorized
reviewer or document and explicitly accept the temporary staffing gap before launch.

References checked 2026-11-01:
- [GitHub environment protection and availability](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [GitHub OIDC guidance](https://docs.github.com/en/actions/concepts/security/openid-connect)
