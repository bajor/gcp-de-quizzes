import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { lintDocs } from "./lint-docs.mjs";

async function fixture(files) {
  const root = await mkdtemp(path.join(os.tmpdir(), "docs-lint-"));
  await Promise.all(
    Object.entries(files).map(async ([name, content]) => {
      const file = path.join(root, name);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, content);
    }),
  );
  return root;
}

test("accepts typed and indexed documents", async (context) => {
  const root = await fixture({
    "index.md": "---\nokf_version: \"0.1\"\n---\n\n[Area](/area/index.md)\n",
    "area/index.md": "# Area\n\n[Concept](/area/concept.md)\n",
    "area/concept.md": "---\ntype: Context\nstatus: Accepted\n---\n\n# Concept\n",
  });
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.deepEqual((await lintDocs(root)).errors, []);
});

test("reports broken relative links", async (context) => {
  const root = await fixture({
    "index.md": "---\nokf_version: \"0.1\"\n---\n\n[Area](/area/index.md)\n",
    "area/index.md": "# Area\n\n[Concept](/area/concept.md)\n",
    "area/concept.md": "---\ntype: Context\n---\n\n[Missing](../missing.md)\n",
  });
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.match((await lintDocs(root)).errors.join("\n"), /broken link/);
});

test("reports indexes unreachable from the root", async (context) => {
  const root = await fixture({
    "index.md": "---\nokf_version: \"0.1\"\n---\n",
    "area/index.md": "# Area\n\n[Concept](/area/concept.md)\n",
    "area/concept.md": "---\ntype: Context\n---\n\n# Concept\n",
  });
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.match((await lintDocs(root)).errors.join("\n"), /index is unreachable/);
});

test("does not treat plain path text as index membership", async (context) => {
  const root = await fixture({
    "index.md": "---\nokf_version: \"0.1\"\n---\n\n[Area](/area/index.md)\n",
    "area/index.md": "# Area\n\nNot indexed: /area/concept.md\n",
    "area/concept.md": "---\ntype: Context\n---\n\n# Concept\n",
  });
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.match((await lintDocs(root)).errors.join("\n"), /missing from directory index/);
});

test("requires supersession targets", async (context) => {
  const root = await fixture({
    "index.md": "---\nokf_version: \"0.1\"\n---\n\n[ADR](/adr/index.md)\n",
    "adr/index.md": "# ADR\n\n[Old](/adr/0001-old.md)\n",
    "adr/0001-old.md": "---\ntype: ADR\nstatus: Superseded\nsuperseded_by:\n---\n\n# Old\n",
  });
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.match((await lintDocs(root)).errors.join("\n"), /has no superseded_by/);
});

test("requires an existing bidirectional supersession target", async (context) => {
  const root = await fixture({
    "index.md": "---\nokf_version: \"0.1\"\n---\n\n[ADR](/adr/index.md)\n",
    "adr/index.md": "# ADR\n\n[Old](/adr/0001-old.md)\n",
    "adr/0001-old.md": "---\ntype: ADR\nstatus: Superseded\nsuperseded_by: 0002\n---\n\n# Old\n",
  });
  context.after(() => rm(root, { recursive: true, force: true }));
  assert.match((await lintDocs(root)).errors.join("\n"), /target does not exist/);
});
