import { expect, it } from "vitest";
import { buildReviewDocument, buildValidDraft, buildValidReviewRecord } from "../../test/questionSetFactory";
import { activateQuestionSet, assembleCandidateQuestionSets } from "../../domain/questions";

it("assembles and activates a registered draft with its matching review", () => {
  const questionSet = assembleCandidateQuestionSets([buildValidDraft()], ["valid-set"])[0];
  const document = buildReviewDocument(buildValidReviewRecord(questionSet));
  expect(activateQuestionSet(questionSet, document)).toBe(questionSet);
});
