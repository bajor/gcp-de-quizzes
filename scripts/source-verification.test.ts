import { expect, it } from "vitest";
import { fixtureQuestionSet, singleQuestion } from "../src/test/fixtures";
import type { DraftQuestionSet, QuestionSection } from "../src/domain/questions";
import { collectEvidenceUrls, findSourceFailures } from "./source-verification";

const draft: DraftQuestionSet = {
  id: "draft",
  version: 1,
  title: "Draft",
  guideVersion: "4.2",
  durationMinutes: 120,
  sections: [{
    section: "design",
    author: "author",
    questions: [singleQuestion],
  } satisfies QuestionSection<"design">],
};

it("collects evidence from a draft-only question", () => {
  expect(collectEvidenceUrls([draft], [])).toContain("https://docs.cloud.google.com/docs");
});

it("collects evidence from a candidate question set", () => {
  expect(collectEvidenceUrls([], [fixtureQuestionSet])).toContain("https://docs.cloud.google.com/docs");
});

it("deduplicates repeated evidence URLs", () => {
  expect(collectEvidenceUrls([draft, draft], [])).toHaveLength(1);
});

it("reports an unsuccessful source response", async () => {
  const failures = await findSourceFailures(["https://cloud.google.com/missing"], async () => ({
    ok: false,
    status: 404,
    url: "https://cloud.google.com/missing",
  }));
  expect(failures).toEqual(["https://cloud.google.com/missing: HTTP 404"]);
});

it("rejects a successful redirect to a non-Google host", async () => {
  const failures = await findSourceFailures(["https://cloud.google.com/redirect"], async () => ({
    ok: true,
    status: 200,
    url: "https://example.com/content",
  }));
  expect(failures).toEqual([
    "https://cloud.google.com/redirect: redirected to non-Google source https://example.com/content",
  ]);
});
