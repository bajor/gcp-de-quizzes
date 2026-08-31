import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

export const examSections = {
  design: "Designing data processing systems",
  ingest: "Ingesting and processing the data",
  store: "Storing the data",
  analyze: "Preparing and using data for analysis",
  operate: "Maintaining and automating data workloads",
} as const;

export type ExamSection = keyof typeof examSections;
export type ChoiceId = "a" | "b" | "c" | "d" | "e";
export const examSectionIds = Object.keys(examSections) as readonly ExamSection[];

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
export type QuestionForSection<S extends ExamSection> = Question & { readonly section: S };

export interface QuestionSection<S extends ExamSection = ExamSection> {
  readonly section: S;
  readonly author: string;
  readonly questions: readonly QuestionForSection<S>[];
}

export type AnyQuestionSection = {
  readonly [S in ExamSection]: QuestionSection<S>;
}[ExamSection];

export interface RejectedQuestion {
  readonly id: string;
  readonly reason: string;
}

export interface DraftQuestionSet {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly guideVersion: "4.2";
  readonly durationMinutes: 120;
  readonly sections: readonly AnyQuestionSection[];
}

export interface ReviewRecord {
  readonly questionSetId: string;
  readonly questionSetVersion: number;
  readonly contentSha256: string;
  readonly reviewer: string;
  readonly authors: readonly string[];
  readonly reviewedOn: `${number}-${number}-${number}`;
  readonly sourceCheckCommand: string;
  readonly sourceCheckPassed: boolean;
  readonly sourceCount: number;
  readonly acceptedQuestionIds: readonly string[];
  readonly rejectedQuestions: readonly RejectedQuestion[];
}

export interface RejectionRecord {
  readonly questionSetId: string;
  readonly questionSetVersion: number;
  readonly contentSha256: string;
  readonly reviewer: string;
  readonly authors: readonly string[];
  readonly reviewedOn: `${number}-${number}-${number}`;
  readonly sourceCheckCommand: string;
  readonly sourceCheckPassed: boolean;
  readonly sourceCount: number;
  readonly questionIds: readonly string[];
  readonly rejectedQuestions: readonly RejectedQuestion[];
}

export interface QuestionSet {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly guideVersion: "4.2";
  readonly durationMinutes: 120;
  readonly authors: readonly string[];
  readonly questions: readonly Question[];
}

export const expectedSectionCounts: Readonly<Record<ExamSection, number>> = {
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

export function isGoogleOwnedSourceUrl(url: string): boolean {
  try {
    return googleHosts.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function validateQuestionSet(set: QuestionSet): string[] {
  const errors = validateQuestionSetMetadata(set);
  const sectionCounts = Object.fromEntries(
    examSectionIds.map((section) => [section, 0]),
  ) as Record<ExamSection, number>;

  if (!hasValidAuthors(set.authors)) errors.push("Question set requires unique identified authors.");
  if (set.questions.length !== 50) errors.push("Question set must contain exactly 50 questions.");
  errors.push(...validateQuestions(set.questions));
  for (const question of set.questions) {
    if (isExamSection(question.section)) sectionCounts[question.section] += 1;
    else errors.push(`${question.id}: unknown exam section.`);
  }

  for (const section of examSectionIds) {
    if (sectionCounts[section] !== expectedSectionCounts[section]) {
      errors.push(`${section}: expected ${expectedSectionCounts[section]} questions.`);
    }
  }

  return errors;
}

export function validateDraftQuestionSet(draft: DraftQuestionSet): string[] {
  const errors = validateQuestionSetMetadata(draft);
  const sectionIds = new Set<ExamSection>();
  const questionSections = new Map<string, ExamSection>();

  for (const section of draft.sections) {
    if (!isExamSection(section.section)) {
      errors.push("Draft contains an unknown exam section.");
      continue;
    }
    if (sectionIds.has(section.section)) errors.push(`${section.section}: duplicate draft section.`);
    sectionIds.add(section.section);
    if (!section.author.trim() || section.author !== section.author.trim()) {
      errors.push(`${section.section}: section requires an identified author.`);
    }
    if (section.questions.length !== expectedSectionCounts[section.section]) {
      errors.push(`${section.section}: expected ${expectedSectionCounts[section.section]} questions.`);
    }
    errors.push(...validateQuestions(section.questions));
    for (const question of section.questions) {
      if (question.section !== section.section) {
        errors.push(`${question.id}: question section does not match ${section.section}.`);
      }
      const previousSection = questionSections.get(question.id);
      if (previousSection && previousSection !== section.section) {
        errors.push(`${question.id}: duplicate question ID across draft sections.`);
      }
      questionSections.set(question.id, section.section);
    }
  }

  return errors;
}

export function validateDraftQuestionSets(drafts: readonly DraftQuestionSet[]): string[] {
  const errors = drafts.flatMap((draft) => validateDraftQuestionSet(draft).map((error) => `${draft.id}: ${error}`));
  const draftIds = new Set<string>();
  for (const draft of drafts) {
    if (draftIds.has(draft.id)) errors.push(`${draft.id}: duplicate draft question-set ID.`);
    draftIds.add(draft.id);
  }
  return errors;
}

export function assembleQuestionSet(draft: DraftQuestionSet): QuestionSet {
  const errors = validateDraftQuestionSet(draft);
  const sections = new Map(draft.sections.map((section) => [section.section, section]));
  for (const section of examSectionIds) {
    if (!sections.has(section)) errors.push(`${section}: draft section is missing.`);
  }
  if (errors.length > 0) throw new Error(`Question-set assembly failed:\n${errors.join("\n")}`);

  const questionSet: QuestionSet = {
    id: draft.id,
    version: draft.version,
    title: draft.title,
    guideVersion: draft.guideVersion,
    durationMinutes: draft.durationMinutes,
    authors: [...new Set(draft.sections.map((section) => section.author))],
    questions: examSectionIds.flatMap(
      (section): readonly Question[] => sections.get(section)?.questions ?? [],
    ),
  };
  const setErrors = validateQuestionSet(questionSet);
  if (setErrors.length > 0) throw new Error(`Question-set assembly failed:\n${setErrors.join("\n")}`);
  return questionSet;
}

export function assembleCandidateQuestionSets(
  drafts: readonly DraftQuestionSet[],
  candidateIds: readonly string[],
): QuestionSet[] {
  const candidates = candidateIds.map((id) => {
    const draft = drafts.find((questionSet) => questionSet.id === id);
    if (!draft) throw new Error(`${id}: candidate has no registered draft question set.`);
    return assembleQuestionSet(draft);
  });
  const errors = validateQuestionSets(candidates);
  if (errors.length > 0) throw new Error(`Candidate registration failed:\n${errors.join("\n")}`);
  return candidates;
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

export function createReviewRecord(
  set: QuestionSet,
  reviewer: string,
  reviewedOn: `${number}-${number}-${number}`,
): ReviewRecord {
  return {
    questionSetId: set.id,
    questionSetVersion: set.version,
    contentSha256: questionSetContentSha256(set),
    reviewer,
    authors: set.authors,
    reviewedOn,
    sourceCheckCommand: "make verify-sources",
    sourceCheckPassed: true,
    sourceCount: new Set(set.questions.flatMap((question) => question.evidence.map((source) => source.url))).size,
    acceptedQuestionIds: set.questions.map((question) => question.id),
    rejectedQuestions: [],
  };
}

export function createRejectionRecord(
  set: QuestionSet,
  reviewer: string,
  reviewedOn: `${number}-${number}-${number}`,
  rejectedQuestions: readonly RejectedQuestion[],
): RejectionRecord {
  return {
    questionSetId: set.id,
    questionSetVersion: set.version,
    contentSha256: questionSetContentSha256(set),
    reviewer,
    authors: set.authors,
    reviewedOn,
    sourceCheckCommand: "make verify-sources",
    sourceCheckPassed: true,
    sourceCount: new Set(set.questions.flatMap((question) => question.evidence.map((source) => source.url))).size,
    questionIds: set.questions.map((question) => question.id),
    rejectedQuestions,
  };
}

export function activateQuestionSet(questionSet: QuestionSet, reviewDocument: string | undefined): QuestionSet {
  const errors = validateQuestionSet(questionSet);
  if (!reviewDocument) errors.push("Question set requires an indexed review document.");
  else {
    try {
      errors.push(...validateReviewRecord(questionSet, parseReviewRecord(reviewDocument)));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Question-set review could not be parsed.");
    }
  }
  if (errors.length > 0) throw new Error(`Question-set activation failed:\n${errors.join("\n")}`);
  return questionSet;
}

function validateQuestionSetMetadata(set: Pick<QuestionSet, "id" | "version" | "title">): string[] {
  const errors: string[] = [];
  if (!set.id.trim()) errors.push("Question set ID cannot be empty.");
  if (!Number.isSafeInteger(set.version) || set.version < 1) {
    errors.push("Question set version must be a positive integer.");
  }
  if (!set.title.trim()) errors.push("Question set title cannot be empty.");
  return errors;
}

function validateQuestions(questions: readonly Question[]): string[] {
  const errors: string[] = [];
  const questionIds = new Set<string>();
  for (const question of questions) {
    if (!question.id.trim()) errors.push("Question ID cannot be empty.");
    if (questionIds.has(question.id)) errors.push(`${question.id}: duplicate question ID.`);
    questionIds.add(question.id);

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
      if (!isGoogleOwnedSourceUrl(source.url)) errors.push(`${question.id}: non-Google or invalid source.`);
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
  return errors;
}

function hasValidAuthors(authors: readonly string[]): boolean {
  return authors.length > 0 &&
    new Set(authors).size === authors.length &&
    authors.every((author) => author.trim().length > 0 && author === author.trim());
}

function isExamSection(value: string): value is ExamSection {
  return value in examSections;
}

export function validateReviewRecord(set: QuestionSet, review: ReviewRecord): string[] {
  const errors = validateReviewProvenance(set, review);
  const questionIds = new Set(set.questions.map((question) => question.id));
  const acceptedQuestionIds = new Set(review.acceptedQuestionIds);
  if (
    review.acceptedQuestionIds.length !== questionIds.size ||
    acceptedQuestionIds.size !== questionIds.size ||
    [...questionIds].some((id) => !acceptedQuestionIds.has(id))
  ) {
    errors.push("Review record must accept every question exactly once.");
  }
  if (review.rejectedQuestions.length > 0) errors.push("A review with rejected questions cannot activate a set.");

  return errors;
}

export function validateRejectionRecordFormat(review: RejectionRecord): string[] {
  return [...validateReviewMetadata(review), ...validateRejectedQuestions(review)];
}

export function validateRejectionRecord(set: QuestionSet, review: RejectionRecord): string[] {
  const errors = [...validateReviewProvenance(set, review), ...validateRejectedQuestions(review)];
  const questionIds = new Set(review.questionIds);
  if (
    questionIds.size !== set.questions.length ||
    set.questions.some((question) => !questionIds.has(question.id))
  ) {
    errors.push("Rejection record question IDs do not match the question set.");
  }
  return errors;
}

export function parseReviewRecord(document: string): ReviewRecord {
  const match = document.match(/## Review Record\s+```json\s+([\s\S]*?)\s+```/);
  if (!match) throw new Error("Review document has no JSON review record.");
  const value: unknown = JSON.parse(match[1]);
  if (!isReviewRecord(value)) throw new Error("Review document has an invalid JSON review record.");
  return value;
}

export function parseRejectionRecord(document: string): RejectionRecord {
  const match = document.match(/## Rejection Record\s+```json\s+([\s\S]*?)\s+```/);
  if (!match) throw new Error("Rejection report has no JSON rejection record.");
  const value: unknown = JSON.parse(match[1]);
  if (!isRejectionRecord(value)) throw new Error("Rejection report has an invalid JSON rejection record.");
  return value;
}

export function questionSetContentSha256(set: QuestionSet): string {
  return bytesToHex(sha256(new TextEncoder().encode(canonicalJson(set))));
}

function isReviewRecord(value: unknown): value is ReviewRecord {
  if (!isReviewMetadata(value)) return false;
  return "acceptedQuestionIds" in value &&
    Array.isArray(value.acceptedQuestionIds) &&
    value.acceptedQuestionIds.every((id) => typeof id === "string") &&
    isRejectedQuestions(value.rejectedQuestions);
}

function isRejectionRecord(value: unknown): value is RejectionRecord {
  if (!isReviewMetadata(value)) return false;
  return "questionIds" in value &&
    Array.isArray(value.questionIds) &&
    value.questionIds.every((id) => typeof id === "string") &&
    isRejectedQuestions(value.rejectedQuestions);
}

function isReviewMetadata(value: unknown): value is ReviewRecord | RejectionRecord {
  if (!value || typeof value !== "object") return false;
  const review = value as Record<string, unknown>;
  return typeof review.questionSetId === "string" &&
    typeof review.questionSetVersion === "number" &&
    typeof review.contentSha256 === "string" &&
    typeof review.reviewer === "string" &&
    Array.isArray(review.authors) && review.authors.every((author) => typeof author === "string") &&
    typeof review.reviewedOn === "string" &&
    typeof review.sourceCheckCommand === "string" &&
    typeof review.sourceCheckPassed === "boolean" &&
    typeof review.sourceCount === "number";
}

function isRejectedQuestions(value: unknown): value is readonly RejectedQuestion[] {
  return Array.isArray(value) && value.every((rejection) =>
    Boolean(rejection) &&
    typeof rejection === "object" &&
    typeof (rejection as Record<string, unknown>).id === "string" &&
    typeof (rejection as Record<string, unknown>).reason === "string"
  );
}

function validateReviewMetadata(review: ReviewRecord | RejectionRecord): string[] {
  const errors: string[] = [];
  if (!review.questionSetId.trim() || review.questionSetId !== review.questionSetId.trim()) {
    errors.push("Review record requires a valid question-set ID.");
  }
  if (!Number.isSafeInteger(review.questionSetVersion) || review.questionSetVersion < 1) {
    errors.push("Review record requires a positive question-set version.");
  }
  if (!/^[0-9a-f]{64}$/.test(review.contentSha256)) errors.push("Review record requires a SHA-256 content digest.");
  if (!review.reviewer.trim() || review.reviewer !== review.reviewer.trim() || review.authors.includes(review.reviewer)) {
    errors.push("Question set requires an independent reviewer.");
  }
  if (!hasValidAuthors(review.authors)) errors.push("Question set requires identified authors.");
  if (!isIsoDate(review.reviewedOn)) errors.push("Question set has an invalid review date.");
  if (review.sourceCheckCommand !== "make verify-sources") errors.push("Question set requires the canonical source-check command.");
  if (!review.sourceCheckPassed) errors.push("Question sources have not passed live verification.");
  if (!Number.isSafeInteger(review.sourceCount) || review.sourceCount < 1) errors.push("Review record requires a positive source count.");
  return errors;
}

function validateReviewProvenance(set: QuestionSet, review: ReviewRecord | RejectionRecord): string[] {
  const errors = validateReviewMetadata(review);
  if (review.questionSetId !== set.id) errors.push("Review record identifies a different question set.");
  if (review.questionSetVersion !== set.version) errors.push("Review record identifies a different question-set version.");
  if (review.contentSha256 !== questionSetContentSha256(set)) errors.push("Review record does not match question-set content.");
  const reviewAuthors = new Set(review.authors);
  if (reviewAuthors.size !== set.authors.length || set.authors.some((author) => !reviewAuthors.has(author))) {
    errors.push("Review record authors do not match question-set authors.");
  }
  const uniqueSourceCount = new Set(set.questions.flatMap((question) => question.evidence.map((source) => source.url))).size;
  if (review.sourceCount !== uniqueSourceCount) errors.push("Review source count does not match unique evidence URLs.");
  const latestVerification = [...set.questions].sort((a, b) => b.verifiedOn.localeCompare(a.verifiedOn))[0]?.verifiedOn;
  if (latestVerification && review.reviewedOn < latestVerification) errors.push("Review predates question verification.");
  return errors;
}

function validateRejectedQuestions(review: RejectionRecord): string[] {
  const errors: string[] = [];
  const questionIds = new Set(review.questionIds);
  if (
    review.questionIds.length !== 50 ||
    questionIds.size !== review.questionIds.length ||
    review.questionIds.some((id) => !id.trim() || id !== id.trim())
  ) {
    errors.push("Rejection record must identify all 50 questions exactly once.");
  }
  const rejectedIds = new Set(review.rejectedQuestions.map((rejection) => rejection.id));
  if (
    review.rejectedQuestions.length === 0 ||
    rejectedIds.size !== review.rejectedQuestions.length ||
    review.rejectedQuestions.some((rejection) =>
      !questionIds.has(rejection.id) ||
      !rejection.reason.trim() ||
      rejection.reason !== rejection.reason.trim()
    )
  ) {
    errors.push("Rejection record requires unique known question IDs with concrete reasons.");
  }
  return errors;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(",")}}`;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
