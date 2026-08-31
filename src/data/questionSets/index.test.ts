import { expect, it } from "vitest";
import {
  buildReviewDocument,
  buildValidQuestionSet,
  buildValidReviewRecord,
} from "../../test/questionSetFactory";
import { activateQuestionSet, type QuestionSet } from "../../domain/questions";

it("rejects activation without a review document", () => {
  const questionSet = buildValidQuestionSet();
  expect(() => activateQuestionSet(questionSet, undefined)).toThrow("Question set requires an indexed review document.");
});

it("rejects activation with a malformed review document", () => {
  const questionSet = buildValidQuestionSet();
  expect(() => activateQuestionSet(questionSet, "# Review")).toThrow("Review document has no JSON review record.");
});

it("activates valid content with its matching review", () => {
  const questionSet = buildValidQuestionSet();
  const document = buildReviewDocument(buildValidReviewRecord(questionSet));
  expect(activateQuestionSet(questionSet, document)).toBe(questionSet);
});

it("rejects content changed after independent review", () => {
  const questionSet = buildValidQuestionSet();
  const document = buildReviewDocument(buildValidReviewRecord(questionSet));
  const firstQuestion = questionSet.questions[0];
  const changed = {
    ...questionSet,
    questions: [{ ...firstQuestion, prompt: "Changed after review" }, ...questionSet.questions.slice(1)],
  } as QuestionSet;
  expect(() => activateQuestionSet(changed, document)).toThrow("Review record does not match question-set content.");
});
