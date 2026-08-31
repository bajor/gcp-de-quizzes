import {
  createRejectionRecord,
  createReviewRecord,
  examSectionIds,
  expectedSectionCounts,
  type AnyQuestionSection,
  type DraftQuestionSet,
  type ExamSection,
  type QuestionSet,
  type RejectionRecord,
  type ReviewRecord,
  type SingleChoiceQuestion,
} from "../domain/questions";

export function buildValidQuestionSet(): QuestionSet {
  const questions: SingleChoiceQuestion[] = [];
  for (const section of examSectionIds) {
    for (let index = 0; index < expectedSectionCounts[section]; index += 1) {
      questions.push(question(section, index + 1));
    }
  }
  return {
    id: "valid-set",
    version: 1,
    title: "Valid set",
    guideVersion: "4.2",
    durationMinutes: 120,
    authors: ["author"],
    questions,
  };
}

export function buildValidDraft(): DraftQuestionSet {
  const set = buildValidQuestionSet();
  const sections = examSectionIds.map((section) => ({
    section,
    author: "author",
    questions: set.questions.filter((item) => item.section === section),
  })) as AnyQuestionSection[];
  return {
    id: set.id,
    version: set.version,
    title: set.title,
    guideVersion: set.guideVersion,
    durationMinutes: set.durationMinutes,
    sections,
  };
}

export function buildValidReviewRecord(set: QuestionSet): ReviewRecord {
  return createReviewRecord(set, "reviewer", "2026-08-31");
}

export function buildValidRejectionRecord(set: QuestionSet): RejectionRecord {
  return createRejectionRecord(set, "reviewer", "2026-08-31", [
    { id: set.questions[0].id, reason: "The prompt is ambiguous." },
  ]);
}

export function buildReviewDocument(review: ReviewRecord): string {
  return `# Review\n\n## Review Record\n\n\`\`\`json\n${JSON.stringify(review)}\n\`\`\``;
}

export function buildRejectionDocument(review: RejectionRecord): string {
  return `# Rejection\n\n## Rejection Record\n\n\`\`\`json\n${JSON.stringify(review)}\n\`\`\``;
}

function question(section: ExamSection, number: number): SingleChoiceQuestion {
  return {
    id: `${section}-q${number}`,
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
  };
}
