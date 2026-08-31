import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";

const execFileAsync = promisify(execFile);

it("runs the documented review-record command outside Vite", async () => {
  const execution = execFileAsync(
    "node_modules/.bin/tsx",
    ["scripts/create-review-record.ts", "missing-set", "reviewer", "2026-08-31"],
  );
  await expect(execution).rejects.toMatchObject({
    stderr: expect.stringContaining("missing-set: candidate question set not found."),
  });
});

it("runs the documented rejection-record command outside Vite", async () => {
  const execution = execFileAsync(
    "node_modules/.bin/tsx",
    [
      "scripts/create-rejection-record.ts",
      "missing-set",
      "reviewer",
      "2026-08-31",
      '[{"id":"design-q1","reason":"Ambiguous."}]',
    ],
  );
  await expect(execution).rejects.toMatchObject({
    stderr: expect.stringContaining("missing-set: candidate question set not found."),
  });
});
