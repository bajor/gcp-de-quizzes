export const examSections = {
  design: "Designing data processing systems",
  ingest: "Ingesting and processing the data",
  store: "Storing the data",
  analyze: "Preparing and using data for analysis",
  operate: "Maintaining and automating data workloads",
} as const;

export type ExamSection = keyof typeof examSections;
export type ChoiceId = "a" | "b" | "c" | "d" | "e";

export interface Evidence {
  readonly id: string;
  readonly title: string;
  readonly url: `https://${string}`;
  readonly claim: string;
}

export interface Choice {
  readonly id: ChoiceId;
  readonly text: string;
  readonly feedback: string;
  readonly evidenceIds: readonly string[];
}

type FourChoices = readonly [Choice, Choice, Choice, Choice];
type FiveChoices = readonly [Choice, Choice, Choice, Choice, Choice];

interface BaseQuestion {
  readonly id: string;
  readonly section: ExamSection;
  readonly objective: string;
  readonly prompt: string;
  readonly verifiedOn: `${number}-${number}-${number}`;
  readonly evidence: readonly Evidence[];
}

export interface SingleChoiceQuestion extends BaseQuestion {
  readonly kind: "single";
  readonly choices: FourChoices;
  readonly correctChoiceId: ChoiceId;
}

export interface MultipleSelectQuestion extends BaseQuestion {
  readonly kind: "multiple";
  readonly requiredSelections: 2;
  readonly choices: FiveChoices;
  readonly correctChoiceIds: readonly [ChoiceId, ChoiceId];
}

export type Question = SingleChoiceQuestion | MultipleSelectQuestion;

export interface ReviewRecord {
  readonly questionSetId: string;
  readonly reviewer: string;
  readonly authors: readonly string[];
  readonly reviewedOn: `${number}-${number}-${number}`;
  readonly sourceCheckCommand: string;
  readonly sourceCheckPassed: boolean;
  readonly sourceCount: number;
  readonly acceptedQuestionIds: readonly string[];
}

export interface QuestionSet {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly guideVersion: "4.2";
  readonly durationMinutes: 120;
  readonly questions: readonly Question[];
}

const expectedSectionCounts: Readonly<Record<ExamSection, number>> = {
  design: 11,
  ingest: 12,
  store: 10,
  analyze: 8,
  operate: 9,
};

const googleHosts = new Set([
  "cloud.google.com",
  "docs.cloud.google.com",
  "developers.google.com",
  "services.google.com",
  "support.google.com",
]);

export function validateQuestionSet(set: QuestionSet): string[] {
  const errors: string[] = [];
  const questionIds = new Set<string>();
  const sectionCounts = Object.fromEntries(
    Object.keys(examSections).map((section) => [section, 0]),
  ) as Record<ExamSection, number>;

  if (!set.id.trim()) errors.push("Question set ID cannot be empty.");
  if (!Number.isSafeInteger(set.version) || set.version < 1) errors.push("Question set version must be a positive integer.");
  if (!set.title.trim()) errors.push("Question set title cannot be empty.");
  if (set.questions.length !== 50) errors.push("Question set must contain exactly 50 questions.");
  for (const question of set.questions) {
    if (!question.id.trim()) errors.push("Question ID cannot be empty.");
    if (questionIds.has(question.id)) errors.push(`${question.id}: duplicate question ID.`);
    questionIds.add(question.id);
    sectionCounts[question.section] += 1;

    const choiceIds = new Set(question.choices.map((choice) => choice.id));
    const expectedChoiceCount = question.kind === "single" ? 4 : 5;
    if (question.choices.length !== expectedChoiceCount) {
      errors.push(`${question.id}: ${question.kind} question must have ${expectedChoiceCount} choices.`);
    }
    if (choiceIds.size !== question.choices.length) errors.push(`${question.id}: duplicate choice ID.`);
    const evidenceIds = new Set(question.evidence.map((source) => source.id));
    if (evidenceIds.size !== question.evidence.length) errors.push(`${question.id}: duplicate evidence ID.`);

    if (!question.objective.trim()) errors.push(`${question.id}: missing exam objective.`);
    if (!question.prompt.trim()) errors.push(`${question.id}: missing prompt.`);
    if (!isIsoDate(question.verifiedOn)) errors.push(`${question.id}: invalid verification date.`);
    for (const source of question.evidence) {
      if (!source.id.trim()) errors.push(`${question.id}: evidence ID cannot be empty.`);
      if (!source.title.trim() || !source.claim.trim()) errors.push(`${question.id}/${source.id}: incomplete evidence.`);
      try {
        if (!googleHosts.has(new URL(source.url).hostname)) errors.push(`${question.id}: non-Google source.`);
      } catch {
        errors.push(`${question.id}: invalid source URL.`);
      }
    }
    for (const choice of question.choices) {
      if (!choice.text.trim()) errors.push(`${question.id}/${choice.id}: missing choice text.`);
      if (!choice.feedback.trim()) errors.push(`${question.id}/${choice.id}: missing feedback.`);
      if (choice.evidenceIds.length === 0) errors.push(`${question.id}/${choice.id}: missing evidence.`);
      for (const evidenceId of choice.evidenceIds) {
        if (!evidenceIds.has(evidenceId)) errors.push(`${question.id}/${choice.id}: unknown evidence.`);
      }
    }

    const correctIds = question.kind === "single" ? [question.correctChoiceId] : question.correctChoiceIds;
    if (correctIds.some((id) => !choiceIds.has(id))) errors.push(`${question.id}: unknown correct choice.`);
    if (new Set(correctIds).size !== correctIds.length) errors.push(`${question.id}: duplicate correct choice.`);
    if (question.kind === "multiple" && question.requiredSelections !== correctIds.length) {
      errors.push(`${question.id}: selection count must match the answer key.`);
    }
  }

  for (const section of Object.keys(examSections) as ExamSection[]) {
    if (sectionCounts[section] !== expectedSectionCounts[section]) {
      errors.push(`${section}: expected ${expectedSectionCounts[section]} questions.`);
    }
  }

  return errors;
}

export function validateQuestionSets(sets: readonly QuestionSet[]): string[] {
  const errors = sets.flatMap((set) => validateQuestionSet(set).map((error) => `${set.id}: ${error}`));
  const setIds = new Set<string>();
  for (const set of sets) {
    if (setIds.has(set.id)) errors.push(`${set.id}: duplicate question-set ID.`);
    setIds.add(set.id);
  }
  return errors;
}

export function validateReviewRecord(set: QuestionSet, review: ReviewRecord): string[] {
  const errors: string[] = [];
  const questionIds = new Set(set.questions.map((question) => question.id));
  if (review.questionSetId !== set.id) errors.push("Review record identifies a different question set.");
  if (
    !review.reviewer.trim() ||
    review.reviewer !== review.reviewer.trim() ||
    review.authors.includes(review.reviewer)
  ) {
    errors.push("Question set requires an independent reviewer.");
  }
  if (
    review.authors.length === 0 ||
    new Set(review.authors).size !== review.authors.length ||
    review.authors.some((author) => !author.trim() || author !== author.trim())
  ) {
    errors.push("Question set requires identified authors.");
  }
  if (!isIsoDate(review.reviewedOn)) errors.push("Question set has an invalid review date.");
  if (review.sourceCheckCommand !== "make verify-sources") errors.push("Question set requires the canonical source-check command.");
  if (!review.sourceCheckPassed) errors.push("Question sources have not passed live verification.");
  const uniqueSourceCount = new Set(set.questions.flatMap((question) => question.evidence.map((source) => source.url))).size;
  if (review.sourceCount !== uniqueSourceCount) errors.push("Review source count does not match unique evidence URLs.");
  const acceptedQuestionIds = new Set(review.acceptedQuestionIds);
  if (
    review.acceptedQuestionIds.length !== questionIds.size ||
    acceptedQuestionIds.size !== questionIds.size ||
    [...questionIds].some((id) => !acceptedQuestionIds.has(id))
  ) {
    errors.push("Review record must accept every question exactly once.");
  }
  const latestVerification = [...set.questions].sort((a, b) => b.verifiedOn.localeCompare(a.verifiedOn))[0]?.verifiedOn;
  if (latestVerification && review.reviewedOn < latestVerification) errors.push("Review predates question verification.");

  return errors;
}

export function parseReviewRecord(document: string): ReviewRecord {
  const match = document.match(/## Review Record\s+```json\s+([\s\S]*?)\s+```/);
  if (!match) throw new Error("Review document has no JSON review record.");
  const value: unknown = JSON.parse(match[1]);
  if (!isReviewRecord(value)) throw new Error("Review document has an invalid JSON review record.");
  return value;
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  if (!value || typeof value !== "object") return false;
  const review = value as Record<string, unknown>;
  return typeof review.questionSetId === "string" &&
    typeof review.reviewer === "string" &&
    Array.isArray(review.authors) && review.authors.every((author) => typeof author === "string") &&
    typeof review.reviewedOn === "string" &&
    typeof review.sourceCheckCommand === "string" &&
    typeof review.sourceCheckPassed === "boolean" &&
    typeof review.sourceCount === "number" &&
    Array.isArray(review.acceptedQuestionIds) &&
    review.acceptedQuestionIds.every((id) => typeof id === "string");
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
