# Company SaaS plugin

An optional company contribution to existing AIDLC stages. See
[company overview](../../company/README.md) and [design](../../company/design.md).
It ships six prose contributions and five shared knowledge documents. It adds no
stage, scope, lifecycle state, sensor or engine code. Disabling it restores the
stock stage text; installed knowledge can remain available.

## Build and verify

From this repository checkout, using Bun 1.4.4 or newer:

```sh
bun install --frozen-lockfile
bun core/tools/aidlc-plugin-validate.ts plugins/company-saas
bun scripts/package.ts
bun test plugins/company-saas/tests/plugin.test.ts
bun scripts/package.ts --check
```

The validator's absent-compose-hook warning is expected: the upstream builder
injects its own current hook. Generated output is ignored under
`dist/plugins/company-saas/<harness>/`. Do not commit it or vendor the composer.
The tests compose the real plugin across the seven upstream harness projections,
check that guide paths resolve, prove repeated composition does not duplicate
fragments, and disable back to stock stages. They also exercise bootstrap safety.
These deterministic tests do not launch live model sessions.

## Pilot installation

Install and configure AIDLC in a disposable consumer project using the
[upstream install guide](../../docs/guide/18-install-and-lifecycle.md), and keep
its selected engine version recorded in the consumer repo. Build this plugin from
a reviewed, pinned source commit. Test it against that installed runtime first:

```sh
bun core/tools/aidlc-plugin-test.ts plugins/company-saas --install ../product-one --harness codex
```

This tests on a temporary copy; the consumer install is unchanged. To compose the
built Codex projection into the consumer, substitute absolute paths below:

```sh
aidlc engine plugin sync --project-dir /path/to/product-one --harness-dir .codex --plugin-root /path/to/aidlc-workflows/dist/plugins/company-saas/codex
```

This explicit sync is a composition smoke test, not host plugin registration.
In the consumer project run `aidlc engine plugin list` and `aidlc doctor`. A scratch
copy without host registration can report “installed plugin missing” even though
composition passed; it also has no live-hook evidence. For persistent use, publish
the reviewed host projection/catalog and install through the host-native plugin
manager as described in the upstream authoring guide, then sync and start a new
session. Resolve the inventory warning before claiming the host installation works.
Preserve any existing plugin selection; if this plugin
is excluded, add `company-saas` alongside the existing selected plugin names via
`aidlc engine plugin select`. Do not replace the selection with a hardcoded list.
No marketplace or unattended installation is configured by this PR.

For other harnesses build their projection and follow upstream's host-specific
installation instructions. Kiro projections place the plugin root inside
`.kiro/aidlc-plugins/company-saas/`, not at the projection root. This matters when
passing `--plugin-root`. Use [the authoring guide](../../docs/harness-engineering/10-authoring-a-plugin.md)
for host distribution. Run a live host smoke before declaring a host supported.

## Runtime behavior and updates

Contributions run only when their existing target stage is on the chosen plan.
Use full Ideation for a new-product investment; MVP/express/bugfix scopes do not
implicitly acquire discovery just because the plugin is installed. A known issue
fix should not be forced through market validation. The plugin uses supported
`before-step` anchors before artifact creation/deployment rather than adding
late prose after a stage has reported completion.

After an engine reinstall/upgrade, rebuild with the candidate engine, run the
composition tests, then sync again and check doctor. Composition can be dropped
if upstream changes a target or anchor; a successful file copy is insufficient.
Review upstream changes to these six stages and the plugin schema each time.
No `when` predicate, `required_sections` enforcement, memory projection or skills
contribution is assumed. Those surfaces are deferred or non-enforcing at the
inspected upstream revision. Portable skills are supplied by the separate bootstrap.
