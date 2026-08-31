import {
  activateQuestionSet,
} from "../../domain/questions";
import { candidateQuestionSets } from "./candidates";

export { candidateQuestionSets } from "./candidates";
const activeQuestionSetId: string | undefined = undefined;
const reviewDocuments = import.meta.glob("/docs/reviews/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const activeQuestionSetCandidate = candidateQuestionSets.find((questionSet) => questionSet.id === activeQuestionSetId);
export const activeQuestionSet = activeQuestionSetCandidate
  ? activateQuestionSet(activeQuestionSetCandidate, reviewDocuments[`/docs/reviews/${activeQuestionSetCandidate.id}.md`])
  : undefined;
