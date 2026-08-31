import { expect, it } from "vitest";
import type { AnyQuestionSection, QuestionSet, SingleChoiceQuestion } from "./questions";
import {
  assembleCandidateQuestionSets,
  assembleQuestionSet,
  parseRejectionRecord,
  parseReviewRecord,
  validateDraftQuestionSet,
  validateDraftQuestionSets,
  validateQuestionSet,
  validateQuestionSets,
  validateRejectionRecord,
  validateRejectionRecordFormat,
  validateReviewRecord,
} from "./questions";
import {
  buildRejectionDocument,
  buildReviewDocument,
  buildValidDraft as validDraft,
  buildValidQuestionSet as validSet,
  buildValidRejectionRecord as validRejection,
  buildValidReviewRecord as validReview,
} from "../test/questionSetFactory";

it("accepts a structurally complete question set", () => {
  expect(validateQuestionSet(validSet())).toEqual([]);
});

it("rejects a non-Google evidence host", () => {
  const set = validSet();
  const question = set.questions[0] as SingleChoiceQuestion;
  const invalid = {
    ...set,
    questions: [{ ...question, evidence: [{ ...question.evidence[0], url: "https://example.com/docs" }] }, ...set.questions.slice(1)],
  } as QuestionSet;
  expect(validateQuestionSet(invalid)).toContain(`${question.id}: non-Google or invalid source.`);
});

it("rejects a reviewer who authored the set", () => {
  const set = validSet();
  const invalid = { ...validReview(set), reviewer: "author" };
  expect(validateReviewRecord(set, invalid)).toContain("Question set requires an independent reviewer.");
});

it("rejects an accepted-question list containing a duplicate", () => {
  const set = validSet();
  const review = validReview(set);
  const acceptedQuestionIds = [...review.acceptedQuestionIds, review.acceptedQuestionIds[0]];
  const invalid = { ...review, acceptedQuestionIds };
  expect(validateReviewRecord(set, invalid)).toContain("Review record must accept every question exactly once.");
});

it("rejects an inaccurate reviewed source count", () => {
  const set = validSet();
  const invalid = { ...validReview(set), sourceCount: 2 };
  expect(validateReviewRecord(set, invalid)).toContain("Review source count does not match unique evidence URLs.");
});

it("rejects review authors that differ from question-set authors", () => {
  const set = validSet();
  const invalid = { ...validReview(set), authors: ["different-author"] };
  expect(validateReviewRecord(set, invalid)).toContain("Review record authors do not match question-set authors.");
});

it("rejects activation provenance containing rejected questions", () => {
  const set = validSet();
  const invalid = {
    ...validReview(set),
    rejectedQuestions: [{ id: set.questions[0].id, reason: "Ambiguous constraint" }],
  };
  expect(validateReviewRecord(set, invalid)).toContain("A review with rejected questions cannot activate a set.");
});

it("rejects an impossible calendar verification date", () => {
  const set = validSet();
  const question = set.questions[0] as SingleChoiceQuestion;
  const invalid = {
    ...set,
    questions: [{ ...question, verifiedOn: "2026-02-30" }, ...set.questions.slice(1)],
  } as QuestionSet;
  expect(validateQuestionSet(invalid)).toContain(`${question.id}: invalid verification date.`);
});

it("rejects a single-choice question without four choices", () => {
  const set = validSet();
  const question = set.questions[0] as SingleChoiceQuestion;
  const invalid = {
    ...set,
    questions: [{ ...question, choices: question.choices.slice(0, 3) }, ...set.questions.slice(1)],
  } as unknown as QuestionSet;
  expect(validateQuestionSet(invalid)).toContain(`${question.id}: single question must have 4 choices.`);
});

it("rejects a multiple-select question without five choices", () => {
  const set = validSet();
  const question = set.questions[0] as SingleChoiceQuestion;
  const invalidQuestion = {
    ...question,
    kind: "multiple",
    requiredSelections: 2,
    correctChoiceIds: ["a", "b"],
  };
  const invalid = { ...set, questions: [invalidQuestion, ...set.questions.slice(1)] } as unknown as QuestionSet;
  expect(validateQuestionSet(invalid)).toContain(`${question.id}: multiple question must have 5 choices.`);
});

it("rejects a multiple-select count that differs from its answer key", () => {
  const set = validSet();
  const question = set.questions[0] as SingleChoiceQuestion;
  const invalidQuestion = {
    ...question,
    kind: "multiple",
    requiredSelections: 1,
    choices: [...question.choices, { id: "e", text: "E", feedback: "E feedback", evidenceIds: ["source"] }],
    correctChoiceIds: ["a", "b"],
  };
  const invalid = { ...set, questions: [invalidQuestion, ...set.questions.slice(1)] } as unknown as QuestionSet;
  expect(validateQuestionSet(invalid)).toContain(`${question.id}: selection count must match the answer key.`);
});

it("rejects duplicate question-set identifiers", () => {
  const set = validSet();
  expect(validateQuestionSets([set, set])).toContain(`${set.id}: duplicate question-set ID.`);
});

it("parses the machine-readable record from a review document", () => {
  const review = validReview(validSet());
  expect(parseReviewRecord(buildReviewDocument(review))).toEqual(review);
});

it("parses a machine-readable rejection report", () => {
  const rejection = validRejection(validSet());
  expect(parseRejectionRecord(buildRejectionDocument(rejection))).toEqual(rejection);
});

it("rejects a rejection report missing a reviewed question ID", () => {
  const rejection = validRejection(validSet());
  const invalid = { ...rejection, questionIds: rejection.questionIds.slice(1) };
  expect(validateRejectionRecordFormat(invalid)).toContain("Rejection record must identify all 50 questions exactly once.");
});

it("rejects duplicate reviewed question IDs in a rejection report", () => {
  const rejection = validRejection(validSet());
  const invalid = { ...rejection, questionIds: [...rejection.questionIds.slice(1), rejection.questionIds[1]] };
  expect(validateRejectionRecordFormat(invalid)).toContain("Rejection record must identify all 50 questions exactly once.");
});

it("rejects an unknown rejected question ID", () => {
  const rejection = validRejection(validSet());
  const invalid = { ...rejection, rejectedQuestions: [{ id: "unknown", reason: "Unsupported." }] };
  expect(validateRejectionRecordFormat(invalid)).toContain(
    "Rejection record requires unique known question IDs with concrete reasons.",
  );
});

it("rejects an empty rejection reason", () => {
  const set = validSet();
  const rejection = validRejection(set);
  const invalid = { ...rejection, rejectedQuestions: [{ id: set.questions[0].id, reason: "" }] };
  expect(validateRejectionRecord(set, invalid)).toContain(
    "Rejection record requires unique known question IDs with concrete reasons.",
  );
});

it("accepts one structurally complete draft section", () => {
  const draft = validDraft();
  const partialDraft = { ...draft, sections: draft.sections.slice(0, 1) };
  expect(validateDraftQuestionSet(partialDraft)).toEqual([]);
});

it("rejects an incomplete draft section", () => {
  const draft = validDraft();
  const design = draft.sections[0];
  const incomplete = { ...design, questions: design.questions.slice(0, -1) } as AnyQuestionSection;
  const invalid = { ...draft, sections: [incomplete] };
  expect(validateDraftQuestionSet(invalid)).toContain("design: expected 11 questions.");
});

it("rejects a question assigned to the wrong draft section", () => {
  const draft = validDraft();
  const design = draft.sections[0];
  const ingestQuestion = draft.sections[1].questions[0];
  const mismatched = { ...design, questions: [ingestQuestion, ...design.questions.slice(1)] } as AnyQuestionSection;
  const invalid = { ...draft, sections: [mismatched] };
  expect(validateDraftQuestionSet(invalid)).toContain(`${ingestQuestion.id}: question section does not match design.`);
});

it("rejects duplicate draft question-set identifiers", () => {
  const draft = validDraft();
  expect(validateDraftQuestionSets([draft, draft])).toContain(`${draft.id}: duplicate draft question-set ID.`);
});

it("refuses to assemble a question set with missing sections", () => {
  const draft = validDraft();
  const partialDraft = { ...draft, sections: draft.sections.slice(0, 1) };
  expect(() => assembleQuestionSet(partialDraft)).toThrow("ingest: draft section is missing.");
});

it("assembles all complete draft sections into 50 questions", () => {
  expect(assembleQuestionSet(validDraft()).questions).toHaveLength(50);
});

it("refuses a candidate ID without a registered draft", () => {
  expect(() => assembleCandidateQuestionSets([], ["missing-set"])).toThrow(
    "missing-set: candidate has no registered draft question set.",
  );
});
