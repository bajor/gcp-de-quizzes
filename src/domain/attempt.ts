import type { ChoiceId, ExamSection, Question, QuestionSet } from "./questions";

export const attemptStorageKey = "pde-practice-attempt-v1";
const attemptSchemaVersion = 1;
type AttemptStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type Answers = Readonly<Record<string, readonly ChoiceId[]>>;

interface AttemptBase {
  readonly schemaVersion: typeof attemptSchemaVersion;
  readonly setId: string;
  readonly setVersion: number;
  readonly startedAt: number;
  readonly deadline: number;
  readonly answers: Answers;
  readonly markedQuestionIds: readonly string[];
  readonly currentQuestionIndex: number;
}

export interface InProgressAttempt extends AttemptBase {
  readonly status: "in-progress";
}

export interface CompletedAttempt extends AttemptBase {
  readonly status: "completed";
  readonly completedAt: number;
}

export type Attempt = InProgressAttempt | CompletedAttempt;

export interface Score {
  readonly correct: number;
  readonly total: number;
  readonly percentage: number;
  readonly correctQuestionIds: ReadonlySet<string>;
  readonly sections: Readonly<Record<ExamSection, { correct: number; total: number; percentage: number }>>;
}

export function createAttempt(set: QuestionSet, now = Date.now()): InProgressAttempt {
  return {
    schemaVersion: attemptSchemaVersion,
    setId: set.id,
    setVersion: set.version,
    status: "in-progress",
    startedAt: now,
    deadline: now + set.durationMinutes * 60_000,
    answers: {},
    markedQuestionIds: [],
    currentQuestionIndex: 0,
  };
}

export function answerQuestion(
  attempt: InProgressAttempt,
  question: Question,
  choiceId: ChoiceId,
): InProgressAttempt {
  const selected = attempt.answers[question.id] ?? [];
  let nextSelection: readonly ChoiceId[];
  if (question.kind === "single") nextSelection = [choiceId];
  else if (selected.includes(choiceId)) nextSelection = selected.filter((id) => id !== choiceId);
  else if (selected.length < question.requiredSelections) nextSelection = [...selected, choiceId];
  else return attempt;

  return { ...attempt, answers: { ...attempt.answers, [question.id]: nextSelection } };
}

export function completeAttempt(attempt: InProgressAttempt, now = Date.now()): CompletedAttempt {
  return { ...attempt, status: "completed", completedAt: now };
}

export function scoreAttempt(set: QuestionSet, answers: Answers): Score {
  const sectionTotals = Object.fromEntries(
    Object.keys({ design: 0, ingest: 0, store: 0, analyze: 0, operate: 0 }).map((section) => [
      section,
      { correct: 0, total: 0, percentage: 0 },
    ]),
  ) as Record<ExamSection, { correct: number; total: number; percentage: number }>;
  const correctQuestionIds = new Set<string>();

  for (const question of set.questions) {
    const expected = question.kind === "single" ? [question.correctChoiceId] : question.correctChoiceIds;
    const selected = answers[question.id] ?? [];
    const correct = selected.length === expected.length && expected.every((id) => selected.includes(id));
    sectionTotals[question.section].total += 1;
    if (correct) {
      correctQuestionIds.add(question.id);
      sectionTotals[question.section].correct += 1;
    }
  }
  for (const section of Object.keys(sectionTotals) as ExamSection[]) {
    const result = sectionTotals[section];
    result.percentage = percentage(result.correct, result.total);
  }
  return {
    correct: correctQuestionIds.size,
    total: set.questions.length,
    percentage: percentage(correctQuestionIds.size, set.questions.length),
    correctQuestionIds,
    sections: sectionTotals,
  };
}

function percentage(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 1000) / 10;
}

export function saveAttempt(attempt: Attempt, storage: AttemptStorage = localStorage): void {
  try {
    storage.setItem(attemptStorageKey, JSON.stringify(attempt));
  } catch {
    // The attempt remains usable in memory when browser storage is unavailable.
  }
}

export function clearAttempt(storage: AttemptStorage = localStorage): void {
  try {
    storage.removeItem(attemptStorageKey);
  } catch {
    // Storage may be blocked by browser policy.
  }
}

export function loadAttempt(set: QuestionSet, storage: AttemptStorage = localStorage): Attempt | null {
  try {
    const stored = storage.getItem(attemptStorageKey);
    if (!stored) return null;
    const value: unknown = JSON.parse(stored);
    if (!isCompatibleAttempt(value, set)) throw new Error("Incompatible attempt");
    return value;
  } catch {
    clearAttempt(storage);
    return null;
  }
}

function isCompatibleAttempt(value: unknown, set: QuestionSet): value is Attempt {
  if (!value || typeof value !== "object") return false;
  const attempt = value as Record<string, unknown>;
  if (
    attempt.schemaVersion !== attemptSchemaVersion ||
    attempt.setId !== set.id ||
    attempt.setVersion !== set.version ||
    (attempt.status !== "in-progress" && attempt.status !== "completed") ||
    !Number.isSafeInteger(attempt.startedAt) ||
    (attempt.startedAt as number) < 0 ||
    !Number.isSafeInteger(attempt.deadline) ||
    (attempt.deadline as number) - (attempt.startedAt as number) !== set.durationMinutes * 60_000 ||
    !Number.isInteger(attempt.currentQuestionIndex) ||
    (attempt.currentQuestionIndex as number) < 0 ||
    (attempt.currentQuestionIndex as number) >= set.questions.length ||
    !attempt.answers ||
    typeof attempt.answers !== "object" ||
    !Array.isArray(attempt.markedQuestionIds)
  ) return false;
  if (
    attempt.status === "completed" &&
    (!Number.isSafeInteger(attempt.completedAt) || (attempt.completedAt as number) < (attempt.startedAt as number))
  ) return false;

  const questions = new Map(set.questions.map((question) => [question.id, question]));
  for (const [questionId, answer] of Object.entries(attempt.answers as Record<string, unknown>)) {
    const question = questions.get(questionId);
    if (!question || !Array.isArray(answer)) return false;
    const selectionLimit = question.kind === "single" ? 1 : question.requiredSelections;
    if (answer.length > selectionLimit || new Set(answer).size !== answer.length) return false;
    if (answer.some((id) => !question.choices.some((choice) => choice.id === id))) return false;
  }
  const markedQuestionIds = attempt.markedQuestionIds as unknown[];
  return new Set(markedQuestionIds).size === markedQuestionIds.length &&
    markedQuestionIds.every((id) => typeof id === "string" && questions.has(id));
}
