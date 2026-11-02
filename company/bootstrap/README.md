# Bootstrap a consumer repository

Run from this extension's Git checkout using Bun 1.4.4 or newer, after reviewing
and pinning the source commit. The target is a different repository directory;
it may be new or existing. These commands work in a Bun-capable terminal without
shell-specific environment variables. Substitute an actual path for `../product-one`.

```sh
bun company/bootstrap/bootstrap.ts --target ../product-one
bun company/bootstrap/bootstrap.ts --target ../product-one --write
```

The first command previews. The second copies policy knowledge, templates and
skills; creates a local profile and source lock; and appends one marked company
section to `AGENTS.md`. Existing unrelated AGENTS text and other skills survive.
The profile is user-owned and is never overwritten. Matching installed content
is a no-op; differing managed content fails before writes. Source/destination
symlinks are refused. Run against a quiescent checkout, not alongside another
writer. An ordinary write failure rolls back completed file writes; empty created
folders may remain. This is not a crash-atomic filesystem transaction.

The source lock records the source commit, whether relevant source was dirty and
SHA-256 hashes of the shipped immutable snapshot. It is provenance, not a trusted
signature or approval. Use a clean, reviewed source commit for real adoption.
The profile and AGENTS file remain locally editable and are not hash-locked.

Complete `.company-aidlc/profile.json`: product key, repo, platform repo, owners,
tracker project and repository allowlist. Nulls mean unknown, not a configured
integration. Never put credentials there. Add product-specific runtime/CI files
in the consumer repo after choosing its stack. Review and commit the generated
files there. Keep customer evidence in private repositories.

Skills are copied to `.agents/skills/`. Use native discovery where supported;
otherwise explicitly load the named `SKILL.md` through your host. This bootstrap
does not change the host's settings. Install the engine through its supported
installer and follow [plugin composition](../../plugins/company-saas/README.md).

## Upgrade and rollback

1. Start a consumer branch with a clean working tree and identify the installed
   source commit from `.company-aidlc/source.lock.json`.
2. Review the company's source diff and compatibility notes. Run the new bootstrap
   in preview mode; a conflict is an intentional request to reconcile, not a reason
   to force overwrite.
3. Generate a fresh snapshot in a separate disposable directory. Compare managed
   files and the AGENTS block; merge deliberate local changes into the consumer
   branch and preserve its profile. Update the source lock with the reviewed
   snapshot. Prefer proposing broadly useful changes back to this company repo.
4. Rebuild and recompose the plugin after an engine upgrade; run doctor and the
   composition tests. Commit the consumer update with evidence.
5. Roll back via the consumer upgrade commit and the previously pinned engine/plugin
   versions. Recompose after rollback. Do not delete engine state or private evidence.

Windows and Linux execution should be verified in CI before team-wide adoption;
the initial local validation is on macOS. See [the rollout plan](../design.md).
