import { expect, it } from "vitest";
import type { ExamSection, QuestionSet, ReviewRecord, SingleChoiceQuestion } from "./questions";
import { parseReviewRecord, validateQuestionSet, validateQuestionSets, validateReviewRecord } from "./questions";

const distribution: Readonly<Record<ExamSection, number>> = {
  design: 11,
  ingest: 12,
  store: 10,
  analyze: 8,
  operate: 9,
};

function validSet(): QuestionSet {
  const questions: SingleChoiceQuestion[] = [];
  for (const [section, count] of Object.entries(distribution) as [ExamSection, number][]) {
    for (let index = 0; index < count; index += 1) {
      const id = `${section}-q${index + 1}`;
      questions.push({
        id,
        kind: "single",
        section,
        objective: "Objective",
        prompt: "Prompt",
        verifiedOn: "2026-08-31",
        evidence: [{ id: "source", title: "Docs", url: "https://docs.cloud.google.com/docs", claim: "Claim" }],
        choices: [
          { id: "a", text: "A", feedback: "A feedback", evidenceIds: ["source"] },
          { id: "b", text: "B", feedback: "B feedback", evidenceIds: ["source"] },
          { id: "c", text: "C", feedback: "C feedback", evidenceIds: ["source"] },
          { id: "d", text: "D", feedback: "D feedback", evidenceIds: ["source"] },
        ],
        correctChoiceId: "a",
      });
    }
  }
  return {
    id: "valid-set",
    version: 1,
    title: "Valid set",
    guideVersion: "4.2",
    durationMinutes: 120,
    questions,
  };
}

function validReview(set: QuestionSet): ReviewRecord {
  return {
    questionSetId: set.id,
    reviewer: "reviewer",
    authors: ["author"],
    reviewedOn: "2026-08-31",
    sourceCheckCommand: "make verify-sources",
    sourceCheckPassed: true,
    sourceCount: 1,
    acceptedQuestionIds: set.questions.map((question) => question.id),
  };
}

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
  expect(validateQuestionSet(invalid)).toContain(`${question.id}: non-Google source.`);
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
  const document = `# Review\n\n## Review Record\n\n\`\`\`json\n${JSON.stringify(review)}\n\`\`\``;
  expect(parseReviewRecord(document)).toEqual(review);
});
