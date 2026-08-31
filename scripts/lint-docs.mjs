import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const filePath = path.join(directory, entry.name);
      return entry.isDirectory() ? markdownFiles(filePath) : [filePath];
    }),
  );
  return nested.flat().filter((filePath) => filePath.endsWith(".md"));
}

function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) return null;
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return null;

  const values = {};
  for (const line of content.slice(4, end).split("\n")) {
    if (!line.trim() || line.startsWith(" ")) continue;
    const match = line.match(/^([a-zA-Z_][\w-]*):(?:\s*(.*))?$/);
    if (!match) return null;
    values[match[1]] = (match[2] ?? "").trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

function documentLinks(content) {
  const links = [...content.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const match of content.matchAll(/^\[[^\]]+\]:\s*(\S+)/gm)) links.push(match[1]);
  return links.filter((link) => link.split("#")[0].split("?")[0].endsWith(".md"));
}

function resolveLink(source, link, docsRoot) {
  const clean = link.split("#")[0].split("?")[0];
  return clean.startsWith("/")
    ? path.join(docsRoot, clean.slice(1))
    : path.resolve(path.dirname(source), clean);
}

export async function lintDocs(root) {
  const docsRoot = path.resolve(root);
  const files = await markdownFiles(docsRoot);
  const knownFiles = new Set(files.map((file) => path.resolve(file)));
  const contentByFile = new Map(
    await Promise.all(files.map(async (file) => [file, await readFile(file, "utf8")])),
  );
  const errors = [];
  const rootIndex = path.join(docsRoot, "index.md");
  const rootContent = contentByFile.get(rootIndex) ?? "";

  for (const file of files) {
    const relative = path.relative(docsRoot, file).split(path.sep).join("/");
    const basename = path.basename(file);
    const content = contentByFile.get(file);
    const isRootIndex = relative === "index.md";
    const isReserved = basename === "index.md" || basename === "log.md";
    const frontmatter = parseFrontmatter(content);

    if (isReserved && !isRootIndex && frontmatter) {
      errors.push(`${relative}: reserved file must not have frontmatter`);
    }
    if (!isReserved && (!frontmatter || !frontmatter.type)) {
      errors.push(`${relative}: missing valid frontmatter with non-empty type`);
    }

    for (const link of documentLinks(content)) {
      const target = resolveLink(file, link, docsRoot);
      if (!knownFiles.has(target)) errors.push(`${relative}: broken link ${link}`);
    }

    if (!isReserved && relative !== "constitution.md") {
      const index = path.join(path.dirname(file), "index.md");
      const expected = `/${relative}`;
      if (!(contentByFile.get(index) ?? "").includes(expected)) {
        errors.push(`${relative}: missing from directory index`);
      }
    }

    if (basename === "index.md" && !isRootIndex) {
      const rootLink = `/${relative}`;
      if (!rootContent.includes(rootLink)) errors.push(`${relative}: index is unreachable from root`);
    }

    if (!isReserved && frontmatter?.status?.toLowerCase() === "superseded") {
      if (!frontmatter.superseded_by) errors.push(`${relative}: superseded record has no superseded_by`);
    }
  }

  return { errors, count: files.length };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const result = await lintDocs(process.argv[2] ?? "docs");
  if (result.errors.length > 0) {
    console.error(result.errors.join("\n"));
    process.exit(1);
  }
  console.log(`Documentation check passed for ${result.count} Markdown files.`);
}
