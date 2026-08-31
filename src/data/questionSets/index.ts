import {
  parseReviewRecord,
  validateQuestionSet,
  validateReviewRecord,
  type QuestionSet,
} from "../../domain/questions";

export const candidateQuestionSets: readonly QuestionSet[] = [];
const activeQuestionSetId: string | undefined = undefined;
const reviewDocuments = import.meta.glob("/docs/reviews/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

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

const activeQuestionSetCandidate = candidateQuestionSets.find((questionSet) => questionSet.id === activeQuestionSetId);
export const activeQuestionSet = activeQuestionSetCandidate
  ? activateQuestionSet(activeQuestionSetCandidate, reviewDocuments[`/docs/reviews/${activeQuestionSetCandidate.id}.md`])
  : undefined;
