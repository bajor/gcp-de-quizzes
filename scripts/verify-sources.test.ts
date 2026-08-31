import { expect, it } from "vitest";
import { draftQuestionSets } from "../src/data/questionSets/drafts";
import { candidateQuestionSets } from "../src/data/questionSets/candidates";
import {
  parseRejectionRecord,
  validateDraftQuestionSets,
  validateQuestionSets,
  validateRejectionRecord,
  validateRejectionRecordFormat,
} from "../src/domain/questions";
import { collectEvidenceUrls, findSourceFailures } from "./source-verification";

const rejectionDocuments = import.meta.glob("../docs/reviews/*-rejected-*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

it("structurally validates draft and candidate question sets", () => {
  expect(validateDraftQuestionSets(draftQuestionSets)).toEqual([]);
  expect(validateQuestionSets(candidateQuestionSets)).toEqual([]);
});

it("fetches every draft and candidate evidence URL", async () => {
  const failures = await findSourceFailures(
    collectEvidenceUrls(draftQuestionSets, candidateQuestionSets),
    (url) => fetch(url, { redirect: "follow" }),
  );
  expect(failures).toEqual([]);
});

it("validates every rejection report's machine-readable record", () => {
  for (const [path, document] of Object.entries(rejectionDocuments)) {
    const record = parseRejectionRecord(document);
    expect(validateRejectionRecordFormat(record), path).toEqual([]);
    const candidate = candidateQuestionSets.find((set) =>
      set.id === record.questionSetId && set.version === record.questionSetVersion
    );
    expect(candidate, `${path}: rejection report has no matching registered candidate.`).toBeDefined();
    if (!candidate) continue;
    expect(validateRejectionRecord(candidate, record), path).toEqual([]);
  }
});
