import { candidateQuestionSets } from "../src/data/questionSets/candidates";
import { createReviewRecord } from "../src/domain/questions";

const [questionSetId, reviewer, reviewedOn] = process.argv.slice(2);
if (!questionSetId || !reviewer || !reviewedOn || !/^\d{4}-\d{2}-\d{2}$/.test(reviewedOn)) {
  throw new Error("Usage: npm run create-review-record -- <question-set-id> <reviewer-id> <YYYY-MM-DD>");
}

const questionSet = candidateQuestionSets.find((candidate) => candidate.id === questionSetId);
if (!questionSet) throw new Error(`${questionSetId}: candidate question set not found.`);

console.log(JSON.stringify(
  createReviewRecord(questionSet, reviewer, reviewedOn as `${number}-${number}-${number}`),
  null,
  2,
));
