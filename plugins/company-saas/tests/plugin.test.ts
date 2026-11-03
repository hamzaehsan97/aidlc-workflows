import { afterAll, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { bootstrap } from "../../../company/bootstrap/bootstrap.ts";
import { composePluginFixture, pluginRootIn, validatePluginContent } from "../../../tests/harness/plugin-kit.ts";
import { runPluginCompose } from "../../../core/tools/aidlc-plugin-test.ts";
import { HARNESS_MATRIX } from "../../../tests/harness/harness-matrix.ts";

const root = resolve(import.meta.dir, "../../..");
const temporary = mkdtempSync(join(realpathSync(tmpdir()), "company-saas-test-"));
afterAll(() => rmSync(temporary, { recursive: true, force: true }));

const stages = [
  "ideation/market-research", "ideation/approval-handoff",
  "inception/practices-discovery", "inception/contract-design",
  "construction/ci-pipeline", "operation/deployment-execution",
];

test("company plugin validates against upstream's schema", () => {
  expect(validatePluginContent(join(root, "plugins/company-saas"))).toEqual([]);
});

for (const harness of HARNESS_MATRIX) {
  test(`${harness.name}: contributions resolve, recompose once, and disable to stock stages`, () => {
    const originals = new Map<string, string>();
    const fixture = composePluginFixture({
      plugin: "company-saas", harness: harness.name,
      projectDir: join(temporary, `compose-${harness.name}`),
      beforeCompose: ({ projectDir }) => {
        for (const stage of stages) {
          const path = join(projectDir, harness.manifest.harnessDir, "aidlc-common/stages", `${stage}.md`);
          originals.set(path, readFileSync(path, "utf8"));
        }
      },
    });
    expect(fixture.dropLogs).toBe("");
    const composed = new Map<string, string>();
    for (const path of originals.keys()) {
      const content = readFileSync(path, "utf8");
      expect(content).toContain("### Company SaaS guidance");
      expect(content).not.toContain("{{HARNESS_DIR}}");
      const guide = content.match(/Read `([^`]*company-saas-[^`]+\.md)`/);
      expect(guide).not.toBeNull();
      expect(existsSync(join(fixture.projectDir, guide?.[1] ?? "missing"))).toBe(true);
      composed.set(path, content);
    }
    const rerun = runPluginCompose({
      harness: harness.name, harnessLeaf: harness.manifest.harnessDir,
      projectDir: fixture.projectDir, pluginBuilt: pluginRootIn(fixture.pluginBuilt, harness.name),
    });
    expect(rerun.status, rerun.stdout + rerun.stderr).toBe(0);
    for (const [path, content] of composed) expect(readFileSync(path, "utf8")).toBe(content);
    const disable = spawnSync(process.execPath, [
      join(fixture.projectDir, harness.manifest.harnessDir, "tools/aidlc-utility.ts"), "select-plugins", "aidlc",
    ], { cwd: fixture.projectDir, encoding: "utf8", env: {
      ...process.env, AIDLC_PROJECT_DIR: fixture.projectDir,
      AIDLC_HARNESS_DIR: harness.manifest.harnessDir, AIDLC_HARNESS_NAME: harness.name,
    }, timeout: 60_000 });
    expect(disable.status, disable.stdout + disable.stderr).toBe(0);
    for (const [path, content] of originals) expect(readFileSync(path, "utf8")).toBe(content);
  }, 120_000);
}

test("bootstrap previews without writes, installs once and preserves unrelated instructions and profile", () => {
  const target = join(temporary, "consumer");
  mkdirSync(target);
  writeFileSync(join(target, "AGENTS.md"), "# Existing\nKeep these instructions.\n");
  expect(bootstrap(target).length).toBeGreaterThan(0);
  expect(existsSync(join(target, ".company-aidlc"))).toBe(false);
  bootstrap(target, true);
  expect(readFileSync(join(target, "AGENTS.md"), "utf8")).toStartWith("# Existing\nKeep these instructions.\n");
  const profile = join(target, ".company-aidlc/profile.json");
  writeFileSync(profile, '{"product_key":"customer-owned"}\n');
  expect(bootstrap(target, true)).toEqual([]);
  expect(readFileSync(profile, "utf8")).toContain("customer-owned");
  const lock = JSON.parse(readFileSync(join(target, ".company-aidlc/source.lock.json"), "utf8"));
  expect(lock.source_commit).toMatch(/^[0-9a-f]{40}$/);
  expect(lock.files[".agents/skills/company-discovery/SKILL.md"]).toMatch(/^[0-9a-f]{64}$/);
});

test("bootstrap rejects a collision before writing any other files", () => {
  const target = join(temporary, "conflict");
  mkdirSync(join(target, ".company-aidlc/templates"), { recursive: true });
  writeFileSync(join(target, ".company-aidlc/templates/adr.md"), "keep me");
  expect(() => bootstrap(target, true)).toThrow("Conflicting file");
  expect(existsSync(join(target, ".company-aidlc/knowledge"))).toBe(false);
  expect(existsSync(join(target, "AGENTS.md"))).toBe(false);
  expect(readFileSync(join(target, ".company-aidlc/templates/adr.md"), "utf8")).toBe("keep me");
});

test("bootstrap refuses destination symlinks without writing through them", () => {
  const target = join(temporary, "linked");
  const outside = join(temporary, "outside");
  mkdirSync(target); mkdirSync(outside);
  symlinkSync(outside, join(target, ".company-aidlc"), process.platform === "win32" ? "junction" : "dir");
  expect(() => bootstrap(target, true)).toThrow("symlink");
  expect(existsSync(join(outside, "profile.json"))).toBe(false);
});

test("bootstrap refuses changed managed content and malformed AGENTS ownership markers", () => {
  const target = join(temporary, "edited");
  bootstrap(target, true);
  const path = join(target, ".company-aidlc/knowledge/company-saas-engineering-standards.md");
  writeFileSync(path, "local policy");
  expect(() => bootstrap(target, true)).toThrow("Conflicting file");
  expect(readFileSync(path, "utf8")).toBe("local policy");
  const broken = join(temporary, "broken-marker");
  mkdirSync(broken);
  writeFileSync(join(broken, "AGENTS.md"), "<!-- company-saas:begin -->\nlocal text\n");
  expect(() => bootstrap(broken, true)).toThrow("AGENTS block differs");
  expect(existsSync(join(broken, ".company-aidlc"))).toBe(false);
});

test("bootstrap refuses the source checkout and unknown CLI flags", () => {
  expect(() => bootstrap(root, true)).toThrow("outside the extension checkout");
  const result = spawnSync(process.execPath, [join(root, "company/bootstrap/bootstrap.ts"), "--target", join(temporary, "invalid"), "--force"], { encoding: "utf8" });
  expect(result.status).toBe(2);
  expect(existsSync(join(temporary, "invalid"))).toBe(false);
});
