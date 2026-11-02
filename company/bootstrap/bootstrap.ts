import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const begin = "<!-- company-saas:begin -->";
const end = "<!-- company-saas:end -->";
const agentBlock = `${begin}
## Company SaaS practices

Read .company-aidlc/README.md and the relevant installed knowledge for this task.
Use .company-aidlc/profile.json for repository ownership and integration choices.
Company skills live in .agents/skills/company-*/SKILL.md; load explicitly in hosts
that do not discover this directory. Treat unconfigured profile fields as unknown.
Follow existing AIDLC stage and approval mechanisms; this block grants no
additional external-action or deployment permission.
${end}`;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function filesBelow(path: string, prefix = ""): Map<string, string> {
  const files = new Map<string, string>();
  for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = join(path, entry.name);
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Source symlink is unsupported: ${full}`);
    if (entry.isDirectory()) {
      for (const [key, value] of filesBelow(full, `${name}/`)) files.set(key, value);
    } else if (entry.isFile()) files.set(name, readFileSync(full, "utf8"));
    else throw new Error(`Unsupported source entry: ${full}`);
  }
  return files;
}

function assertDestination(path: string): void {
  // A linked ancestor can redirect a nested output outside the selected target.
  for (let cursor = path; ; cursor = dirname(cursor)) {
    let stat: ReturnType<typeof lstatSync>;
    try { stat = lstatSync(cursor); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      if (dirname(cursor) === cursor) break;
      continue;
    }
    if (stat.isSymbolicLink()) throw new Error(`Destination symlink is unsupported: ${cursor}`);
    if (cursor !== path && !stat.isDirectory()) throw new Error(`Not a directory: ${cursor}`);
    if (cursor === path && !stat.isFile()) throw new Error(`Not a regular file: ${cursor}`);
    if (dirname(cursor) === cursor) break;
  }
}

export function bootstrap(targetPath: string, write = false): string[] {
  const target = resolve(targetPath);
  if (target === sourceRoot || target.startsWith(sourceRoot + sep)) {
    throw new Error("Use a consumer repository outside the extension checkout.");
  }
  const desired = new Map<string, string>();
  for (const [name, content] of filesBelow(join(sourceRoot, "plugins/company-saas/knowledge/aidlc-shared"))) {
    desired.set(`.company-aidlc/knowledge/${name}`, content);
  }
  for (const [name, content] of filesBelow(join(sourceRoot, "company/templates"))) {
    if (name !== "profile.json") desired.set(`.company-aidlc/templates/${name}`, content);
  }
  for (const [name, content] of filesBelow(join(sourceRoot, "company/skills"))) {
    desired.set(`.agents/skills/${name}`, content);
  }
  desired.set(".company-aidlc/README.md", `# Company SaaS baseline\n\nThis is a reviewed snapshot, not an installed lifecycle engine.\nEdit profile.json for this repository; preserve source.lock.json for provenance.\nRead the relevant knowledge and copy templates into the owning repo as needed.\nAffirm applicable practices through the existing AIDLC practices-discovery flow.\nInstall/compose the company-saas plugin separately to enrich lifecycle stages.\nProduction and MCP settings are not configured by this snapshot.\nUpgrade in a branch: compare the pinned source, resolve conflicts and review.\n`);
  const revision = spawnSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" });
  if (revision.status !== 0) throw new Error("Run bootstrap from a Git checkout for source provenance.");
  const status = spawnSync("git", ["-C", sourceRoot, "status", "--porcelain", "--", "company", "plugins/company-saas"], { encoding: "utf8" });
  if (status.status !== 0) throw new Error("Cannot inspect source checkout state.");
  const hashes = Object.fromEntries([...desired].sort(([a], [b]) => a.localeCompare(b)).map(([name, content]) => [name, hash(content)]));
  desired.set(".company-aidlc/source.lock.json", `${JSON.stringify({
    schema_version: 1,
    source_repository: "https://github.com/hamzaehsan97/aidlc-workflows",
    source_commit: revision.stdout.trim(),
    source_dirty: status.stdout.trim().length > 0,
    bundle_sha256: hash(JSON.stringify(hashes)),
    files: hashes,
  }, null, 2)}\n`);
  const profile = join(target, ".company-aidlc/profile.json");
  assertDestination(profile);
  if (!existsSync(profile)) desired.set(".company-aidlc/profile.json", readFileSync(join(sourceRoot, "company/templates/profile.json"), "utf8"));

  const agents = join(target, "AGENTS.md");
  assertDestination(agents);
  const hadAgents = existsSync(agents);
  const originalAgents = hadAgents ? readFileSync(agents, "utf8") : "";
  if (originalAgents.includes(begin) || originalAgents.includes(end)) {
    if (originalAgents.split(begin).length !== 2 || originalAgents.split(end).length !== 2 || !originalAgents.includes(agentBlock)) {
      throw new Error("Existing company AGENTS block differs; reconcile it in a reviewed upgrade.");
    }
  } else desired.set("AGENTS.md", `${originalAgents}${originalAgents ? "\n\n" : ""}${agentBlock}\n`);

  const pending: Array<[string, string]> = [];
  for (const [name, content] of desired) {
    const path = join(target, name);
    assertDestination(path);
    if (existsSync(path)) {
      if (readFileSync(path, "utf8") === content) continue;
      if (name !== "AGENTS.md") throw new Error(`Conflicting file: ${name}. Review the upgrade; nothing was written.`);
    }
    pending.push([path, content]);
  }
  const written: string[] = [];
  if (write) {
    try {
      for (const [path, content] of pending) {
        mkdirSync(dirname(path), { recursive: true });
        // Exclusive creation catches collisions introduced after the preflight.
        if (path === agents && existsSync(agents)) {
          if (readFileSync(agents, "utf8") !== originalAgents) throw new Error("AGENTS.md changed during bootstrap; retry after review.");
          writeFileSync(path, content);
        } else writeFileSync(path, content, { flag: "wx" });
        written.push(path);
      }
    } catch (error) {
      for (const path of written.reverse()) {
        if (path === agents && hadAgents) writeFileSync(path, originalAgents);
        else rmSync(path);
      }
      throw error;
    }
  }
  return pending.map(([path]) => path);
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const usage = "Usage: bun company/bootstrap/bootstrap.ts --target <consumer-repo> [--write]";
  if (args[0] !== "--target" || !args[1] || args[1].startsWith("--") || args.length > 3 || (args[2] && args[2] !== "--write")) {
    console.error(usage);
    process.exitCode = 2;
  } else {
    try {
      const paths = bootstrap(args[1], args[2] === "--write");
      console.log(`${args[2] ? "Wrote" : "Would write"} ${paths.length} file(s).`);
      for (const path of paths) console.log(path);
    } catch (error) {
      console.error((error as Error).message);
      process.exitCode = 1;
    }
  }
}
