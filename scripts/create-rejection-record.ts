import { candidateQuestionSets } from "../src/data/questionSets/candidates";
import {
  createRejectionRecord,
  type RejectedQuestion,
  validateRejectionRecord,
} from "../src/domain/questions";

const [questionSetId, reviewer, reviewedOn, rejectedQuestionsJson] = process.argv.slice(2);
if (!questionSetId || !reviewer || !reviewedOn || !/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn) || !rejectedQuestionsJson) {
  throw new Error(
    "Usage: npm run create-rejection-record -- <question-set-id> <reviewer-id> <YYYY-MM-DD> '<rejections-json>'",
  );
}

const rejectedQuestions: unknown = JSON.parse(rejectedQuestionsJson);
if (!isRejectedQuestions(rejectedQuestions)) {
  throw new Error("Rejections JSON must be an array of objects with string id and reason fields.");
}

const questionSet = candidateQuestionSets.find((candidate) => candidate.id === questionSetId);
if (!questionSet) throw new Error(`${questionSetId}: candidate question set not found.`);

const record = createRejectionRecord(
  questionSet,
  reviewer,
  reviewedOn as `${number}-${number}-${number}`,
  rejectedQuestions,
);
const errors = validateRejectionRecord(questionSet, record);
if (errors.length > 0) throw new Error(`Rejection record is invalid:\n${errors.join("\n")}`);

console.log(JSON.stringify(record, null, 2));

function isRejectedQuestions(value: unknown): value is readonly RejectedQuestion[] {
  return Array.isArray(value) && value.every((rejection) =>
    Boolean(rejection) &&
    typeof rejection === "object" &&
    typeof (rejection as Record<string, unknown>).id === "string" &&
    typeof (rejection as Record<string, unknown>).reason === "string"
  );
}
